const router = require('express').Router();
const pool = require('../db');

// GET all children (paginated)
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM children');
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await pool.query('SELECT * FROM children ORDER BY id LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
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

    if (!first_name || !last_name || !date_of_birth) {
      return res.status(400).json({ error: 'first_name, last_name, and date_of_birth are required' });
    }
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
