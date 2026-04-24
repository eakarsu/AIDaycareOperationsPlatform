const router = require('express').Router();
const pool = require('../db');

// GET all staff ratios
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM staff_ratios ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET ratio by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM staff_ratios WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ratio record not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create ratio
router.post('/', async (req, res) => {
  try {
    const { classroom, age_group, staff_count, child_count, required_ratio, actual_ratio, status, ai_suggestion } = req.body;
    const result = await pool.query(
      `INSERT INTO staff_ratios (classroom, age_group, staff_count, child_count, required_ratio, actual_ratio, status, ai_suggestion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [classroom, age_group, staff_count, child_count, required_ratio, actual_ratio, status || 'compliant', ai_suggestion]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update ratio
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { classroom, age_group, staff_count, child_count, required_ratio, actual_ratio, status, ai_suggestion } = req.body;
    const result = await pool.query(
      `UPDATE staff_ratios SET classroom=$1, age_group=$2, staff_count=$3, child_count=$4, required_ratio=$5, actual_ratio=$6, status=$7, ai_suggestion=$8
       WHERE id=$9 RETURNING *`,
      [classroom, age_group, staff_count, child_count, required_ratio, actual_ratio, status, ai_suggestion, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ratio record not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE ratio
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM staff_ratios WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ratio record not found' });
    }
    res.json({ message: 'Ratio record deleted', record: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
