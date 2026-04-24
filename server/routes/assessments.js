const router = require('express').Router();
const pool = require('../db');

// GET all assessments
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ai_assessments ORDER BY date DESC, id');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET assessment by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM ai_assessments WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create assessment
router.post('/', async (req, res) => {
  try {
    const { child_name, assessment_type, date, evaluator, score, age_group, areas_evaluated, strengths, areas_for_improvement, recommendations, status } = req.body;
    const result = await pool.query(
      `INSERT INTO ai_assessments (child_name, assessment_type, date, evaluator, score, age_group, areas_evaluated, strengths, areas_for_improvement, recommendations, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [child_name, assessment_type, date, evaluator, score, age_group, areas_evaluated, strengths, areas_for_improvement, recommendations, status || 'pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update assessment
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { child_name, assessment_type, date, evaluator, score, age_group, areas_evaluated, strengths, areas_for_improvement, recommendations, status } = req.body;
    const result = await pool.query(
      `UPDATE ai_assessments SET child_name=$1, assessment_type=$2, date=$3, evaluator=$4, score=$5, age_group=$6, areas_evaluated=$7, strengths=$8, areas_for_improvement=$9, recommendations=$10, status=$11
       WHERE id=$12 RETURNING *`,
      [child_name, assessment_type, date, evaluator, score, age_group, areas_evaluated, strengths, areas_for_improvement, recommendations, status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE assessment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM ai_assessments WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    res.json({ message: 'Assessment deleted', assessment: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
