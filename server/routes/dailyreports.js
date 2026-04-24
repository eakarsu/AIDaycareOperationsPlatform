const router = require('express').Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM daily_reports ORDER BY date DESC, created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM daily_reports WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { child_name, date, mood, meals_eaten, nap_start, nap_end, activities_summary, bathroom_notes, supplies_needed, teacher_notes, sent_to_parent } = req.body;
    const result = await pool.query(
      `INSERT INTO daily_reports (child_name, date, mood, meals_eaten, nap_start, nap_end, activities_summary, bathroom_notes, supplies_needed, teacher_notes, sent_to_parent)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [child_name, date, mood, meals_eaten, nap_start, nap_end, activities_summary, bathroom_notes, supplies_needed, teacher_notes, sent_to_parent || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { child_name, date, mood, meals_eaten, nap_start, nap_end, activities_summary, bathroom_notes, supplies_needed, teacher_notes, sent_to_parent } = req.body;
    const result = await pool.query(
      `UPDATE daily_reports SET child_name=$1, date=$2, mood=$3, meals_eaten=$4, nap_start=$5, nap_end=$6, activities_summary=$7, bathroom_notes=$8, supplies_needed=$9, teacher_notes=$10, sent_to_parent=$11
       WHERE id=$12 RETURNING *`,
      [child_name, date, mood, meals_eaten, nap_start, nap_end, activities_summary, bathroom_notes, supplies_needed, teacher_notes, sent_to_parent, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM daily_reports WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', record: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
