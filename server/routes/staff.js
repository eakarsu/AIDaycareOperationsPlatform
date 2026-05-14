const router = require('express').Router();
const pool = require('../db');

// GET all staff schedules (paginated)
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM staff_schedules');
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await pool.query('SELECT * FROM staff_schedules ORDER BY date, shift_start LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET staff schedule by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM staff_schedules WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Staff schedule not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create staff schedule
router.post('/', async (req, res) => {
  try {
    const { staff_name, role, date, shift_start, shift_end, classroom, status } = req.body;
    const result = await pool.query(
      `INSERT INTO staff_schedules (staff_name, role, date, shift_start, shift_end, classroom, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [staff_name, role, date, shift_start, shift_end, classroom, status || 'scheduled']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update staff schedule
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { staff_name, role, date, shift_start, shift_end, classroom, status } = req.body;
    const result = await pool.query(
      `UPDATE staff_schedules SET staff_name=$1, role=$2, date=$3, shift_start=$4, shift_end=$5, classroom=$6, status=$7
       WHERE id=$8 RETURNING *`,
      [staff_name, role, date, shift_start, shift_end, classroom, status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Staff schedule not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE staff schedule
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM staff_schedules WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Staff schedule not found' });
    }
    res.json({ message: 'Staff schedule deleted', schedule: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
