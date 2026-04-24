const router = require('express').Router();
const pool = require('../db');

// GET all milestones
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM milestones ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET milestone by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM milestones WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Milestone not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create milestone
router.post('/', async (req, res) => {
  try {
    const { child_name, milestone_type, description, status, age_months, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO milestones (child_name, milestone_type, description, status, age_months, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [child_name, milestone_type, description, status || 'in_progress', age_months, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update milestone
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { child_name, milestone_type, description, status, age_months, notes } = req.body;
    const result = await pool.query(
      `UPDATE milestones SET child_name=$1, milestone_type=$2, description=$3, status=$4, age_months=$5, notes=$6
       WHERE id=$7 RETURNING *`,
      [child_name, milestone_type, description, status, age_months, notes, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Milestone not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE milestone
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM milestones WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Milestone not found' });
    }
    res.json({ message: 'Milestone deleted', milestone: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
