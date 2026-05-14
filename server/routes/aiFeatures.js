/**
 * aiFeatures.js — Custom non-CRUD AI features for the daycare ops platform.
 *
 * Endpoints (audit "Proposed New Features"):
 *   POST /api/ai-features/allergy-conflict-check       — cross-check meal plan vs child allergies
 *   POST /api/ai-features/emergency-drill-recommend    — schedule next drill, audit compliance
 *   POST /api/ai-features/sibling-classroom-coord      — sibling classroom placement & pickup coord
 *   POST /api/ai-features/tuition-subsidy-calc         — tuition + subsidy + invoice calc
 *
 * All endpoints:
 *   - Use aiRateLimiter (20/hr per user).
 *   - Use parseAIJson 3-strategy parser.
 *   - Persist results to ai_results JSONB table.
 */

const router = require('express').Router();
const axios = require('axios');
const pool = require('../db');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { parseAIJson } = require('../middleware/parseAIJson');

const MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_results (
        id SERIAL PRIMARY KEY,
        feature VARCHAR(100) NOT NULL,
        child_id INTEGER,
        user_id INTEGER,
        input JSONB DEFAULT '{}',
        output JSONB DEFAULT '{}',
        model VARCHAR(255),
        success BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS ai_results_feature_idx ON ai_results(feature);
      CREATE INDEX IF NOT EXISTS ai_results_child_idx ON ai_results(child_id);
    `);
  } catch (err) {
    console.error('ai_results table init error:', err.message);
  }
})();

async function callAI(systemPrompt, userMessage) {
  const response = await axios.post(
    OPENROUTER_URL,
    {
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.choices?.[0]?.message?.content || '{}';
}

async function persistAIResult(feature, childId, userId, input, output, success = true) {
  try {
    await pool.query(
      `INSERT INTO ai_results (feature, child_id, user_id, input, output, model, success)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [feature, childId || null, userId || null, JSON.stringify(input), JSON.stringify(output), MODEL, success]
    );
  } catch (err) {
    console.error('persistAIResult error:', err.message);
  }
}

// ─── POST /api/ai-features/allergy-conflict-check ────────────────────────────
// Body: { meal_id }  → fetches meal + all enrolled child allergies, returns conflicts.
router.post('/allergy-conflict-check', aiRateLimiter, async (req, res) => {
  const { meal_id } = req.body;
  if (!meal_id) return res.status(400).json({ error: 'meal_id is required' });

  try {
    const mealResult = await pool.query('SELECT * FROM meals WHERE id = $1', [meal_id]);
    if (mealResult.rows.length === 0) return res.status(404).json({ error: 'Meal not found' });
    const meal = mealResult.rows[0];

    // Fetch children with allergies (assume children table has allergies column or we check immunizations/notes)
    const childrenResult = await pool.query(
      "SELECT id, first_name, last_name, age_group, classroom, COALESCE(allergies, notes) AS allergies FROM children WHERE COALESCE(allergies, notes) IS NOT NULL AND COALESCE(allergies, notes) <> ''"
    ).catch(async () => {
      // Fallback if allergies column doesn't exist
      return await pool.query(
        "SELECT id, first_name, last_name, age_group, classroom, notes AS allergies FROM children WHERE notes IS NOT NULL AND notes <> ''"
      );
    });

    const systemPrompt = `You are a pediatric nutrition + safety expert. Cross-check a meal's ingredients/allergens
against each child's known allergies. Flag any child who would be at risk and propose substitutions. Respond with ONLY valid JSON:
{
  "meal_summary": "<text>",
  "conflicts": [
    { "child_id": <id>, "child_name": "<name>", "matched_allergen": "<text>", "severity": "<low|medium|high>", "substitution": "<text>" }
  ],
  "global_substitutions": ["<text>"],
  "safe_to_serve": <bool>
}`;
    const userMessage = `Meal:
- Name: ${meal.meal_name}
- Type: ${meal.meal_type}
- Age Group: ${meal.age_group || 'all'}
- Description: ${meal.description || ''}
- Allergens listed: ${meal.allergens || 'none'}
- Servings: ${meal.servings || ''}

Children with known allergies (${childrenResult.rows.length}):
${childrenResult.rows.map((c) => `- id=${c.id} ${c.first_name} ${c.last_name} (${c.age_group || 'n/a'}, ${c.classroom || 'n/a'}): ${c.allergies}`).join('\n') || 'none on file'}`;

    const raw = await callAI(systemPrompt, userMessage);
    const parsed = parseAIJson(raw);

    if (!parsed.ok) {
      await persistAIResult('allergy_conflict_check', null, req.user?.id, { meal_id }, { raw }, false);
      return res.status(422).json({ error: 'AI returned non-parseable response', raw });
    }

    await persistAIResult('allergy_conflict_check', null, req.user?.id, { meal_id }, parsed.data);
    res.json({ success: true, meal_id, ...parsed.data, model: MODEL });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// ─── POST /api/ai-features/emergency-drill-recommend ─────────────────────────
// Audits past drill cadence and recommends the next required drill.
router.post('/emergency-drill-recommend', aiRateLimiter, async (req, res) => {
  try {
    // Pull recent incident-tagged "drill" records (or fallback to none)
    const drills = await pool.query(
      `SELECT id, incident_type, severity, date, description, action_taken
         FROM incidents
        WHERE LOWER(incident_type) LIKE '%drill%'
        ORDER BY date DESC LIMIT 30`
    ).catch(() => ({ rows: [] }));

    const classrooms = await pool.query('SELECT id, name, age_group, capacity, current_count FROM classrooms');

    const systemPrompt = `You are a daycare safety officer. Given the recent emergency-drill history and the
classroom roster, recommend the next required drill (fire/earthquake/lockdown/severe-weather) per most state
licensing boards' minimum cadence (fire monthly, earthquake quarterly, lockdown semi-annual, severe-weather
yearly). Respond with ONLY valid JSON:
{
  "next_drill": { "type": "<text>", "due_by": "<YYYY-MM-DD>", "reason": "<text>" },
  "compliance_status": [
    { "drill_type": "<text>", "last_run": "<date or null>", "status": "<compliant|due|overdue>" }
  ],
  "classroom_action_items": [
    { "classroom": "<name>", "action": "<text>" }
  ],
  "notes": "<2 sentence summary>"
}`;
    const userMessage = `Today: ${new Date().toISOString().split('T')[0]}
Past drills:
${drills.rows.map((d) => `- ${d.date}: ${d.incident_type} (${d.severity}) — ${d.action_taken}`).join('\n') || 'none recorded'}

Active classrooms:
${classrooms.rows.map((c) => `- ${c.name} (${c.age_group}): ${c.current_count}/${c.capacity}`).join('\n')}`;

    const raw = await callAI(systemPrompt, userMessage);
    const parsed = parseAIJson(raw);

    if (!parsed.ok) {
      await persistAIResult('emergency_drill_recommend', null, req.user?.id, {}, { raw }, false);
      return res.status(422).json({ error: 'AI returned non-parseable response', raw });
    }

    await persistAIResult('emergency_drill_recommend', null, req.user?.id, {}, parsed.data);
    res.json({ success: true, ...parsed.data, model: MODEL });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// ─── POST /api/ai-features/sibling-classroom-coord ───────────────────────────
// Body: { parent_name } → groups siblings, suggests classroom placement & pickup coord.
router.post('/sibling-classroom-coord', aiRateLimiter, async (req, res) => {
  const { parent_name } = req.body;
  if (!parent_name) return res.status(400).json({ error: 'parent_name is required' });

  try {
    const siblings = await pool.query(
      'SELECT id, first_name, last_name, age_group, classroom, date_of_birth, parent_name FROM children WHERE parent_name ILIKE $1',
      [`%${parent_name}%`]
    );

    if (siblings.rows.length === 0) {
      return res.status(404).json({ error: `No children found for parent matching '${parent_name}'` });
    }

    const classrooms = await pool.query('SELECT id, name, age_group, capacity, current_count FROM classrooms');

    const systemPrompt = `You are a daycare enrollment coordinator. Given a sibling group and current classroom
load, suggest classroom placements that keep siblings logistically close (same wing/pickup point) while
respecting age-group requirements and capacity limits. Respond with ONLY valid JSON:
{
  "siblings": [
    { "child_id": <id>, "name": "<text>", "current_classroom": "<text>", "recommended_classroom": "<text>", "reason": "<text>" }
  ],
  "pickup_plan": "<2 sentence plan>",
  "transition_notes": "<text>",
  "capacity_warnings": ["<text>"]
}`;
    const userMessage = `Parent: ${parent_name}

Children (${siblings.rows.length}):
${siblings.rows.map((s) => `- id=${s.id} ${s.first_name} ${s.last_name}, age group ${s.age_group || 'n/a'}, currently in ${s.classroom || 'unassigned'}`).join('\n')}

Available classrooms:
${classrooms.rows.map((c) => `- ${c.name} (${c.age_group}): ${c.current_count}/${c.capacity} occupied`).join('\n')}`;

    const raw = await callAI(systemPrompt, userMessage);
    const parsed = parseAIJson(raw);

    if (!parsed.ok) {
      await persistAIResult('sibling_classroom_coord', null, req.user?.id, { parent_name }, { raw }, false);
      return res.status(422).json({ error: 'AI returned non-parseable response', raw });
    }

    await persistAIResult('sibling_classroom_coord', siblings.rows[0]?.id, req.user?.id, { parent_name }, parsed.data);
    res.json({ success: true, parent_name, sibling_count: siblings.rows.length, ...parsed.data, model: MODEL });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// ─── POST /api/ai-features/tuition-subsidy-calc ──────────────────────────────
// Body: { child_id, base_tuition, subsidy_program?, hours_per_week?, has_sibling_discount? }
router.post('/tuition-subsidy-calc', aiRateLimiter, async (req, res) => {
  const { child_id, base_tuition, subsidy_program, hours_per_week, has_sibling_discount } = req.body;
  if (!child_id || !base_tuition) {
    return res.status(400).json({ error: 'child_id and base_tuition are required' });
  }

  try {
    const childResult = await pool.query('SELECT * FROM children WHERE id = $1', [child_id]);
    if (childResult.rows.length === 0) return res.status(404).json({ error: 'Child not found' });
    const child = childResult.rows[0];

    // Pull recent billing history for context
    const billingResult = await pool.query(
      'SELECT * FROM billing WHERE child_name ILIKE $1 ORDER BY id DESC LIMIT 6',
      [`%${child.first_name}%`]
    ).catch(() => ({ rows: [] }));

    const systemPrompt = `You are a daycare billing specialist. Compute a fair tuition + subsidy + sibling
discount + part-time prorating breakdown, then build the next invoice. Respect typical state subsidy programs
(CCDF, Head Start, military) and standard sibling discounts (10–15%). Respond with ONLY valid JSON:
{
  "monthly_breakdown": {
    "base_tuition": <number>,
    "sibling_discount": <number>,
    "subsidy_credit": <number>,
    "part_time_prorate": <number>,
    "fees": <number>,
    "total_due": <number>
  },
  "subsidy_eligibility": "<text>",
  "next_invoice_line_items": [
    { "label": "<text>", "amount": <number> }
  ],
  "notes": "<text>"
}`;
    const userMessage = `Child: ${child.first_name} ${child.last_name}, age group ${child.age_group}, classroom ${child.classroom}
Parent: ${child.parent_name || 'n/a'}
Base tuition (full-time monthly): $${base_tuition}
Hours/week: ${hours_per_week || 40}
Subsidy program requested: ${subsidy_program || 'none'}
Sibling discount eligible: ${has_sibling_discount ? 'yes' : 'no'}

Recent billing history:
${billingResult.rows.map((b) => `- ${b.invoice_number || b.id}: $${b.amount} (${b.status})`).join('\n') || 'none'}`;

    const raw = await callAI(systemPrompt, userMessage);
    const parsed = parseAIJson(raw);

    if (!parsed.ok) {
      await persistAIResult('tuition_subsidy_calc', child_id, req.user?.id, req.body, { raw }, false);
      return res.status(422).json({ error: 'AI returned non-parseable response', raw });
    }

    await persistAIResult('tuition_subsidy_calc', child_id, req.user?.id, req.body, parsed.data);
    res.json({
      success: true,
      child: { id: child_id, name: `${child.first_name} ${child.last_name}` },
      ...parsed.data,
      model: MODEL,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// ─── GET /api/ai-features/results ────────────────────────────────────────────
// Paginated audit log of past AI runs.
router.get('/results', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];
  if (req.query.feature) {
    params.push(req.query.feature);
    conditions.push(`feature = $${params.length}`);
  }
  if (req.query.child_id) {
    params.push(req.query.child_id);
    conditions.push(`child_id = $${params.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    params.push(limit, offset);
    const [data, count] = await Promise.all([
      pool.query(
        `SELECT id, feature, child_id, user_id, success, model, created_at, output
           FROM ai_results ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params
      ),
      pool.query(`SELECT COUNT(*) FROM ai_results ${where}`, params.slice(0, -2)),
    ]);

    const total = parseInt(count.rows[0].count);
    res.json({
      data: data.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
