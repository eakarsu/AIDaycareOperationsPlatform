const router = require('express').Router();
const axios = require('axios');
const pool = require('../db');
const { aiRateLimiter } = require('../middleware/rateLimiter');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function callAI(systemPrompt, userMessage) {
  const response = await axios.post(
    OPENROUTER_URL,
    {
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.choices[0].message.content;
}

function requireKey(res) {
  if (!process.env.OPENROUTER_API_KEY) {
    res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY not configured' });
    return false;
  }
  return true;
}

// POST /api/ai/behavioral-tracking
// Accepts { child_id, date_range }, fetches behavioral incidents, returns pattern analysis
router.post('/behavioral-tracking', aiRateLimiter, async (req, res) => {
  try {
    const { child_id, date_range } = req.body;

    if (!child_id) {
      return res.status(400).json({ error: 'child_id is required' });
    }

    // Fetch child info
    const childResult = await pool.query('SELECT * FROM children WHERE id = $1', [child_id]);
    if (childResult.rows.length === 0) {
      return res.status(404).json({ error: 'Child not found' });
    }
    const child = childResult.rows[0];

    // Fetch behavioral incidents for this child
    let incidentQuery = 'SELECT * FROM incidents WHERE child_name ILIKE $1';
    const incidentParams = [`%${child.first_name}%`];
    if (date_range && date_range.start) {
      incidentQuery += ' AND date >= $2';
      incidentParams.push(date_range.start);
    }
    if (date_range && date_range.end) {
      incidentQuery += ` AND date <= $${incidentParams.length + 1}`;
      incidentParams.push(date_range.end);
    }
    incidentQuery += ' ORDER BY date DESC';

    const incidentResult = await pool.query(incidentQuery, incidentParams);
    const incidents = incidentResult.rows;

    const systemPrompt = `You are a child behavior specialist working in a daycare setting. Analyze behavioral incident patterns and provide evidence-based intervention strategies. Consider the child's age, frequency and types of incidents, environmental triggers, and developmental context. Provide specific, actionable recommendations for daycare staff and parents.`;

    const userMessage = `Analyze behavioral patterns for child: ${child.first_name} ${child.last_name}
Age Group: ${child.age_group || 'N/A'}
Classroom: ${child.classroom || 'N/A'}
Date Range: ${date_range ? `${date_range.start || 'N/A'} to ${date_range.end || 'N/A'}` : 'All time'}
Total Incidents: ${incidents.length}

Incident History:
${incidents.slice(0, 20).map(i => `- [${i.date}] Type: ${i.incident_type}, Severity: ${i.severity}, Description: ${i.description}, Action: ${i.action_taken}`).join('\n') || 'No incidents recorded'}

Please provide: 1) Pattern analysis, 2) Identified triggers, 3) Intervention strategies for staff, 4) Recommendations for parents, 5) Any flags requiring professional evaluation.`;

    const content = await callAI(systemPrompt, userMessage);
    res.json({
      child: { id: child_id, name: `${child.first_name} ${child.last_name}` },
      incident_count: incidents.length,
      analysis: content
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'AI service error', details: err.message });
  }
});

// POST /api/ai/staff-schedule-optimizer
// Accepts { date, classroom_ids }, returns optimized schedule
router.post('/staff-schedule-optimizer', aiRateLimiter, async (req, res) => {
  try {
    const { date, classroom_ids } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'date is required' });
    }

    // Fetch staff schedules for the date
    let staffQuery = 'SELECT * FROM staff_schedules WHERE date = $1';
    const staffParams = [date];
    if (classroom_ids && classroom_ids.length > 0) {
      staffQuery += ` AND classroom = ANY($2)`;
      staffParams.push(classroom_ids);
    }
    const staffResult = await pool.query(staffQuery, staffParams);

    // Fetch classrooms
    let classroomQuery = 'SELECT * FROM classrooms WHERE status = $1';
    const classroomParams = ['active'];
    if (classroom_ids && classroom_ids.length > 0) {
      classroomQuery += ' AND id = ANY($2)';
      classroomParams.push(classroom_ids);
    }
    const classroomResult = await pool.query(classroomQuery, classroomParams);

    // Fetch ratios
    const ratioResult = await pool.query('SELECT * FROM staff_ratios ORDER BY age_group');

    const systemPrompt = `You are a workforce scheduling optimization expert for daycare facilities. Optimize staff schedules ensuring regulatory compliance with staff-to-child ratios, consider certification requirements, minimize overtime, ensure adequate coverage during peak hours (7-9am drop-off, 4-6pm pick-up), and flag any ratio violations. Format your response with a clear schedule table and specific recommendations.`;

    const userMessage = `Optimize staff schedule for date: ${date}

Current Staff Schedules (${staffResult.rows.length} entries):
${staffResult.rows.map(s => `- ${s.staff_name} (${s.role}): ${s.shift_start}-${s.shift_end} in ${s.classroom} [${s.status}]`).join('\n') || 'No schedules found'}

Active Classrooms:
${classroomResult.rows.map(c => `- ${c.name}: Age Group ${c.age_group}, Capacity ${c.capacity}, Current Count ${c.current_count}`).join('\n') || 'No classrooms found'}

Required Ratios:
${ratioResult.rows.map(r => `- ${r.age_group}: 1 staff per ${r.max_children || 'N/A'} children`).join('\n') || 'Standard ratios apply'}

Please provide: 1) Compliance status for each classroom, 2) Optimized schedule recommendations, 3) Gaps that need coverage, 4) Certification requirement flags.`;

    const content = await callAI(systemPrompt, userMessage);
    res.json({
      date,
      staff_count: staffResult.rows.length,
      classroom_count: classroomResult.rows.length,
      analysis: content
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'AI service error', details: err.message });
  }
});

// POST /api/ai/developmental-predictor
// Accepts { child_id }, fetches all milestones, returns predicted milestone dates and risk flags
router.post('/developmental-predictor', aiRateLimiter, async (req, res) => {
  try {
    const { child_id } = req.body;

    if (!child_id) {
      return res.status(400).json({ error: 'child_id is required' });
    }

    // Fetch child
    const childResult = await pool.query('SELECT * FROM children WHERE id = $1', [child_id]);
    if (childResult.rows.length === 0) {
      return res.status(404).json({ error: 'Child not found' });
    }
    const child = childResult.rows[0];

    // Fetch milestones for this child
    const milestoneResult = await pool.query(
      'SELECT * FROM milestones WHERE child_name ILIKE $1 ORDER BY age_months ASC',
      [`%${child.first_name}%`]
    );

    // Fetch assessments
    const assessmentResult = await pool.query(
      'SELECT * FROM assessments WHERE child_name ILIKE $1 ORDER BY date DESC',
      [`%${child.first_name}%`]
    );

    const systemPrompt = `You are a developmental pediatrics specialist with expertise in early childhood milestone prediction. Using the child's milestone history and assessments, predict upcoming milestone dates and identify risk factors for developmental delays. Base predictions on established developmental research. Provide specific timelines and confidence levels. Flag any areas requiring early intervention evaluation.`;

    const userMessage = `Developmental prediction for: ${child.first_name} ${child.last_name}
Date of Birth: ${child.date_of_birth || 'N/A'}
Age Group: ${child.age_group || 'N/A'}
Current Date: ${new Date().toISOString().split('T')[0]}

Milestone History (${milestoneResult.rows.length} records):
${milestoneResult.rows.map(m => `- [Age ${m.age_months}mo] ${m.milestone_type}: ${m.status} - ${m.description || 'N/A'}`).join('\n') || 'No milestones recorded'}

Recent Assessments (${assessmentResult.rows.length} records):
${assessmentResult.rows.slice(0, 5).map(a => `- [${a.date}] ${a.assessment_type}: Score ${a.score || 'N/A'} - Strengths: ${a.strengths || 'N/A'}`).join('\n') || 'No assessments recorded'}

Please provide: 1) Next 3-6 expected milestones with predicted date ranges, 2) Current development trajectory, 3) Risk flags for delays by domain (cognitive, language, motor, social-emotional), 4) Recommended monitoring or interventions.`;

    const content = await callAI(systemPrompt, userMessage);
    res.json({
      child: { id: child_id, name: `${child.first_name} ${child.last_name}`, dob: child.date_of_birth },
      milestone_count: milestoneResult.rows.length,
      assessment_count: assessmentResult.rows.length,
      analysis: content
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'AI service error', details: err.message });
  }
});

// POST /api/ai/parent-engagement-report
// Accepts { child_id }, fetches communications + attendance, returns engagement score and suggestions
router.post('/parent-engagement-report', aiRateLimiter, async (req, res) => {
  try {
    const { child_id } = req.body;

    if (!child_id) {
      return res.status(400).json({ error: 'child_id is required' });
    }

    // Fetch child
    const childResult = await pool.query('SELECT * FROM children WHERE id = $1', [child_id]);
    if (childResult.rows.length === 0) {
      return res.status(404).json({ error: 'Child not found' });
    }
    const child = childResult.rows[0];

    // Fetch communications for this child/parent
    const commResult = await pool.query(
      'SELECT * FROM communications WHERE child_name ILIKE $1 OR parent_name ILIKE $2 ORDER BY created_at DESC',
      [`%${child.first_name}%`, `%${child.parent_name}%`]
    );

    // Fetch attendance
    const attendResult = await pool.query(
      'SELECT * FROM attendance WHERE child_name ILIKE $1 ORDER BY date DESC LIMIT 60',
      [`%${child.first_name}%`]
    );

    const presentDays = attendResult.rows.filter(a => a.status === 'present').length;
    const totalDays = attendResult.rows.length;
    const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    const systemPrompt = `You are a family engagement specialist for daycare centers. Analyze parent communication patterns and attendance data to assess parental engagement levels. Provide an engagement score (0-100), identify patterns, and suggest specific touchpoints and strategies to strengthen the parent-daycare relationship. Keep recommendations practical and actionable for daycare staff.`;

    const userMessage = `Parent engagement analysis for: ${child.first_name} ${child.last_name}
Parent: ${child.parent_name || 'N/A'} | Email: ${child.parent_email || 'N/A'} | Phone: ${child.parent_phone || 'N/A'}
Classroom: ${child.classroom || 'N/A'}

Attendance Summary (last 60 records):
- Total Days Recorded: ${totalDays}
- Days Present: ${presentDays}
- Attendance Rate: ${attendanceRate}%

Recent Communications (${commResult.rows.length} total):
${commResult.rows.slice(0, 10).map(c => `- [${new Date(c.created_at).toLocaleDateString()}] ${c.type || 'message'} | Subject: ${c.subject || 'N/A'} | Priority: ${c.priority || 'normal'}`).join('\n') || 'No communications recorded'}

Please provide: 1) Engagement score (0-100) with rationale, 2) Communication pattern analysis, 3) Attendance concern flags if any, 4) Top 3 specific touchpoint suggestions to improve engagement, 5) Any red flags requiring immediate attention.`;

    const content = await callAI(systemPrompt, userMessage);
    res.json({
      child: { id: child_id, name: `${child.first_name} ${child.last_name}` },
      parent: child.parent_name,
      attendance_rate: attendanceRate,
      communication_count: commResult.rows.length,
      analysis: content
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'AI service error', details: err.message });
  }
});

// POST /api/ai/staff-burnout-predictor
// Body: { staff_name?: string, classroom?: string }
// Pulls staff schedule + recent incidents and outputs a 0-100 burnout score
// with drivers and intervention recommendations.
router.post('/staff-burnout-predictor', aiRateLimiter, async (req, res) => {
  if (!requireKey(res)) return;
  try {
    const { staff_name, classroom } = req.body || {};

    let scheduleQuery = 'SELECT * FROM staff_schedules';
    const scheduleParams = [];
    const conditions = [];
    if (staff_name) {
      scheduleParams.push(`%${staff_name}%`);
      conditions.push(`staff_name ILIKE $${scheduleParams.length}`);
    }
    if (classroom) {
      scheduleParams.push(classroom);
      conditions.push(`classroom = $${scheduleParams.length}`);
    }
    if (conditions.length) scheduleQuery += ' WHERE ' + conditions.join(' AND ');
    scheduleQuery += ' ORDER BY date DESC LIMIT 60';

    const scheduleResult = await pool.query(scheduleQuery, scheduleParams).catch(() => ({ rows: [] }));

    const incidentResult = await pool.query(
      'SELECT * FROM incidents ORDER BY date DESC LIMIT 60'
    ).catch(() => ({ rows: [] }));

    const systemPrompt = `You are an occupational psychologist specializing in early-childhood-education staff wellbeing. Given recent staff workload (shifts, hours, classroom assignments) and incident exposure, output a 0-100 burnout-risk score, the top contributing drivers, and concrete intervention recommendations a daycare director can act on this week. Be conservative; only flag high risk when supported by the data.`;

    const userMessage = `Staff burnout assessment
Filters: staff_name=${staff_name || 'all'}, classroom=${classroom || 'all'}
Window: trailing 60 schedule entries / 60 incidents

Recent Schedules (${scheduleResult.rows.length}):
${scheduleResult.rows.slice(0, 30).map((s) => `- [${s.date}] ${s.staff_name} (${s.role || 'n/a'}) ${s.shift_start}-${s.shift_end} in ${s.classroom || 'n/a'} [${s.status || 'n/a'}]`).join('\n') || 'no schedule data'}

Recent Incidents (${incidentResult.rows.length}):
${incidentResult.rows.slice(0, 20).map((i) => `- [${i.date}] ${i.incident_type} (${i.severity}) staff=${i.staff_involved || 'n/a'} — ${i.description || ''}`).join('\n') || 'no incidents'}

Please provide: 1) Burnout risk score (0-100) with rationale, 2) Top contributing drivers, 3) Coverage / scheduling fixes for next 2 weeks, 4) Wellbeing interventions, 5) Any individuals or classrooms to escalate.`;

    const content = await callAI(systemPrompt, userMessage);
    res.json({
      filters: { staff_name: staff_name || null, classroom: classroom || null },
      schedule_count: scheduleResult.rows.length,
      incident_count: incidentResult.rows.length,
      analysis: content
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'AI service error', details: err.message });
  }
});

// POST /api/ai/state-compliance-check
// Body: { state: string, compliance?: { ... } }
// State-parameterized variant of compliance-check.
router.post('/state-compliance-check', aiRateLimiter, async (req, res) => {
  if (!requireKey(res)) return;
  try {
    const { state, compliance } = req.body || {};
    if (!state) return res.status(400).json({ error: 'state is required' });

    const systemPrompt = `You are a daycare licensing compliance expert with deep knowledge of US state-specific child-care licensing rules. Given a US state and a compliance item, evaluate whether the item meets that state's requirements, identify gaps relative to state-specific rules (ratios, sq-ft per child, background-check cadence, training hours, immunization waiver rules, mandated reporter timelines, etc.), and produce concrete remediation steps.`;

    const userMessage = `State: ${state}
Compliance item:
- Requirement: ${compliance?.requirement || 'N/A'}
- Category: ${compliance?.category || 'N/A'}
- Status: ${compliance?.status || 'N/A'}
- Due Date: ${compliance?.due_date || 'N/A'}
- Responsible Person: ${compliance?.responsible_person || 'N/A'}
- Notes: ${compliance?.notes || 'N/A'}

Please return: 1) Applicable ${state} rule citation (best-effort), 2) Compliance verdict (compliant / gap / unclear), 3) Gap analysis, 4) State-specific remediation steps with timelines, 5) Risk if unaddressed.`;

    const content = await callAI(systemPrompt, userMessage);
    res.json({ state, analysis: content });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'AI service error', details: err.message });
  }
});

module.exports = router;
