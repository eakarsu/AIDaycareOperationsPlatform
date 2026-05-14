const router = require('express').Router();
const axios = require('axios');
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

// POST /api/ai/milestone-assessment
router.post('/milestone-assessment', aiRateLimiter, async (req, res) => {
  try {
    const { milestone } = req.body;
    const systemPrompt = `You are an expert child development specialist working in a daycare setting. Analyze the child's developmental milestones and provide a detailed assessment. Consider age-appropriate expectations across cognitive, physical, social-emotional, and language domains. Provide specific recommendations for activities and interventions to support the child's development. Flag any areas of concern that may need professional evaluation.`;
    const userMessage = `Please assess this developmental milestone:\nChild: ${milestone?.child_name || 'Unknown'}\nType: ${milestone?.milestone_type || 'General'}\nAge (months): ${milestone?.age_months || 'N/A'}\nStatus: ${milestone?.status || 'N/A'}\nDescription: ${milestone?.description || 'N/A'}\nNotes: ${milestone?.notes || 'N/A'}`;
    const content = await callAI(systemPrompt, userMessage);
    res.json({ analysis: content });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'AI service error', details: err.message });
  }
});

// POST /api/ai/compliance-check
router.post('/compliance-check', aiRateLimiter, async (req, res) => {
  try {
    const { compliance } = req.body;
    const systemPrompt = `You are a daycare licensing compliance expert. Analyze the provided compliance requirement and its current status. Identify any gaps, upcoming deadlines, and potential risks. Provide specific actionable recommendations to maintain full compliance with state and local daycare licensing regulations. Consider health and safety codes, staff qualifications, facility requirements, and documentation standards.`;
    const userMessage = `Please review this licensing compliance requirement and provide recommendations:\nRequirement: ${compliance?.requirement || 'N/A'}\nCategory: ${compliance?.category || 'N/A'}\nStatus: ${compliance?.status || 'N/A'}\nDue Date: ${compliance?.due_date || 'N/A'}\nResponsible Person: ${compliance?.responsible_person || 'N/A'}\nNotes: ${compliance?.notes || 'N/A'}`;
    const content = await callAI(systemPrompt, userMessage);
    res.json({ analysis: content });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'AI service error', details: err.message });
  }
});

// POST /api/ai/parent-response
router.post('/parent-response', aiRateLimiter, async (req, res) => {
  try {
    const { communication } = req.body;
    const systemPrompt = `You are a warm, professional daycare administrator skilled in parent communication. Draft a thoughtful, empathetic response to the parent's message. Be informative and reassuring while maintaining professional boundaries. Address specific concerns raised, provide relevant information about daycare policies or the child's progress, and suggest next steps if appropriate. Keep the tone friendly yet professional.`;
    const userMessage = `Draft a response to parent ${communication?.parent_name || 'Unknown'} regarding their child ${communication?.child_name || 'Unknown'}.\nSubject: ${communication?.subject || 'N/A'}\nType: ${communication?.type || 'general'}\nPriority: ${communication?.priority || 'normal'}\nTheir message: ${communication?.message || 'N/A'}`;
    const content = await callAI(systemPrompt, userMessage);
    res.json({ analysis: content });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'AI service error', details: err.message });
  }
});

// POST /api/ai/ratio-optimization
router.post('/ratio-optimization', aiRateLimiter, async (req, res) => {
  try {
    const { ratio } = req.body;
    const systemPrompt = `You are a daycare operations expert specializing in staff-to-child ratio management. Analyze the current staff-to-child ratios. Ensure compliance with state regulations for each age group. Identify if the classroom is overstaffed or understaffed. Provide specific recommendations for staff reallocation, hiring needs, and scheduling adjustments to optimize ratios while maintaining regulatory compliance and quality of care.`;
    const userMessage = `Analyze and optimize this staff-to-child ratio:\nClassroom: ${ratio?.classroom || 'N/A'}\nAge Group: ${ratio?.age_group || 'N/A'}\nStaff Count: ${ratio?.staff_count || 'N/A'}\nChild Count: ${ratio?.child_count || 'N/A'}\nRequired Ratio: ${ratio?.required_ratio || 'N/A'}\nStatus: ${ratio?.status || 'N/A'}`;
    const content = await callAI(systemPrompt, userMessage);
    res.json({ analysis: content });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'AI service error', details: err.message });
  }
});

// POST /api/ai/incident-analysis
router.post('/incident-analysis', aiRateLimiter, async (req, res) => {
  try {
    const { incident } = req.body;
    const systemPrompt = `You are a child safety and risk management expert for daycare facilities. Analyze the reported incident thoroughly. Assess the severity, identify root causes, and evaluate the response taken. Provide recommendations for preventing similar incidents, required documentation and reporting obligations, follow-up actions needed, and any changes to safety protocols or facility arrangements. Consider both immediate and long-term implications.`;
    const userMessage = `Please analyze this safety incident:\nChild: ${incident?.child_name || 'N/A'}\nType: ${incident?.incident_type || 'N/A'}\nSeverity: ${incident?.severity || 'N/A'}\nDate: ${incident?.date || 'N/A'}\nTime: ${incident?.time || 'N/A'}\nLocation: ${incident?.location || 'N/A'}\nDescription: ${incident?.description || 'N/A'}\nAction Taken: ${incident?.action_taken || 'N/A'}\nReported By: ${incident?.reported_by || 'N/A'}\nParent Notified: ${incident?.parent_notified ? 'Yes' : 'No'}`;
    const content = await callAI(systemPrompt, userMessage);
    res.json({ analysis: content });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'AI service error', details: err.message });
  }
});

// POST /api/ai/nutrition-analysis
router.post('/nutrition-analysis', aiRateLimiter, async (req, res) => {
  try {
    const { meal } = req.body;
    const systemPrompt = `You are a pediatric nutrition expert specializing in daycare meal planning. Analyze the provided meal plan for nutritional completeness and age-appropriateness. Evaluate caloric content, macronutrient balance, vitamin and mineral coverage, and allergen considerations. Provide specific recommendations for improvements, substitutions for common allergens, and ensure the meal meets USDA Child and Adult Care Food Program (CACFP) guidelines. Consider portion sizes appropriate for the specified age group.`;
    const userMessage = `Please analyze this meal plan:\nMeal: ${meal?.meal_name || 'N/A'}\nType: ${meal?.meal_type || 'N/A'}\nAge Group: ${meal?.age_group || 'N/A'}\nCalories: ${meal?.calories || 'N/A'}\nDescription: ${meal?.description || 'N/A'}\nAllergens: ${meal?.allergens || 'None'}\nServings: ${meal?.servings || 'N/A'}`;
    const content = await callAI(systemPrompt, userMessage);
    res.json({ analysis: content });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'AI service error', details: err.message });
  }
});

// POST /api/ai/developmental-report
router.post('/developmental-report', aiRateLimiter, async (req, res) => {
  try {
    const { assessment } = req.body;
    const systemPrompt = `You are a child development assessment specialist working in early childhood education. Generate a comprehensive developmental report based on the assessment data provided. Cover all developmental domains: cognitive, language, physical/motor, social-emotional, and adaptive behavior. Compare the child's progress to age-appropriate benchmarks. Include strengths, areas for growth, specific goals, and recommended activities for both the daycare setting and home environment. Format the report professionally for sharing with parents.`;
    const userMessage = `Generate a comprehensive developmental report:\nChild: ${assessment?.child_name || 'N/A'}\nAssessment Type: ${assessment?.assessment_type || 'N/A'}\nEvaluator: ${assessment?.evaluator || 'N/A'}\nDate: ${assessment?.date || 'N/A'}\nScore: ${assessment?.score || 'N/A'}\nAge Group: ${assessment?.age_group || 'N/A'}\nAreas Evaluated: ${assessment?.areas_evaluated || 'N/A'}\nStrengths: ${assessment?.strengths || 'N/A'}\nAreas for Improvement: ${assessment?.areas_for_improvement || 'N/A'}\nRecommendations: ${assessment?.recommendations || 'N/A'}`;
    const content = await callAI(systemPrompt, userMessage);
    res.json({ analysis: content });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'AI service error', details: err.message });
  }
});

// POST /api/ai/schedule-optimization
router.post('/schedule-optimization', aiRateLimiter, async (req, res) => {
  try {
    const { schedule, allSchedules } = req.body;
    const systemPrompt = `You are a workforce scheduling optimization expert for daycare facilities. Analyze the current staff schedules and optimize them considering staff-to-child ratio requirements for each age group, staff availability and preferences, overtime minimization, adequate coverage during peak hours (drop-off and pick-up times), break scheduling compliance with labor laws, and cross-training opportunities. Provide a detailed optimized schedule with explanations for changes.`;
    const userMessage = `Optimize this staff schedule:\nStaff: ${schedule?.staff_name || 'N/A'}\nRole: ${schedule?.role || 'N/A'}\nDate: ${schedule?.date || 'N/A'}\nShift: ${schedule?.shift_start || 'N/A'} - ${schedule?.shift_end || 'N/A'}\nClassroom: ${schedule?.classroom || 'N/A'}\nStatus: ${schedule?.status || 'N/A'}\n\nAll schedules for context: ${JSON.stringify(allSchedules?.slice(0, 20) || [])}`;
    const content = await callAI(systemPrompt, userMessage);
    res.json({ analysis: content });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'AI service error', details: err.message });
  }
});

// POST /api/ai/activity-suggestions
router.post('/activity-suggestions', aiRateLimiter, async (req, res) => {
  try {
    const { activity } = req.body;
    const systemPrompt = `You are an early childhood education expert specializing in developmentally appropriate activities for daycare settings. Analyze the provided activity and suggest improvements, variations, extensions, and safety considerations. Consider the age group, learning objectives, materials needed, and how to make the activity more inclusive and engaging. Provide specific suggestions for adapting the activity for different skill levels within the age group.`;
    const userMessage = `Please provide suggestions for this activity:\nActivity: ${activity?.activity_name || 'N/A'}\nType: ${activity?.activity_type || 'N/A'}\nAge Group: ${activity?.age_group || 'N/A'}\nDuration: ${activity?.duration ? activity.duration + ' min' : 'N/A'}\nClassroom: ${activity?.classroom || 'N/A'}\nDescription: ${activity?.description || 'N/A'}\nMaterials: ${activity?.materials_needed || 'N/A'}\nLearning Objectives: ${activity?.learning_objectives || 'N/A'}\nLed By: ${activity?.led_by || 'N/A'}`;
    const content = await callAI(systemPrompt, userMessage);
    res.json({ analysis: content });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'AI service error', details: err.message });
  }
});

module.exports = router;
