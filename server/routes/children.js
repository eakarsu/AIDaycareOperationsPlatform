const router = require('express').Router();
const pool = require('../db');

// GET all children
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM children ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET child by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM children WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Child not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create child
router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, date_of_birth, age_group, parent_name, parent_email, parent_phone, classroom, allergies, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO children (first_name, last_name, date_of_birth, age_group, parent_name, parent_email, parent_phone, classroom, allergies, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [first_name, last_name, date_of_birth, age_group, parent_name, parent_email, parent_phone, classroom, allergies, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update child
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, date_of_birth, age_group, parent_name, parent_email, parent_phone, classroom, allergies, notes } = req.body;
    const result = await pool.query(
      `UPDATE children SET first_name=$1, last_name=$2, date_of_birth=$3, age_group=$4, parent_name=$5, parent_email=$6, parent_phone=$7, classroom=$8, allergies=$9, notes=$10
       WHERE id=$11 RETURNING *`,
      [first_name, last_name, date_of_birth, age_group, parent_name, parent_email, parent_phone, classroom, allergies, notes, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Child not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE child
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM children WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Child not found' });
    }
    res.json({ message: 'Child deleted', child: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
