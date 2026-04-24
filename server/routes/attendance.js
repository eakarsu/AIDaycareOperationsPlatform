const router = require('express').Router();
const pool = require('../db');

// GET all attendance records
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM attendance ORDER BY date DESC, id');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET attendance by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM attendance WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create attendance record
router.post('/', async (req, res) => {
  try {
    const { child_name, date, check_in, check_out, status, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO attendance (child_name, date, check_in, check_out, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [child_name, date, check_in, check_out, status || 'present', notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update attendance record
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { child_name, date, check_in, check_out, status, notes } = req.body;
    const result = await pool.query(
      `UPDATE attendance SET child_name=$1, date=$2, check_in=$3, check_out=$4, status=$5, notes=$6
       WHERE id=$7 RETURNING *`,
      [child_name, date, check_in, check_out, status, notes, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE attendance record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM attendance WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    res.json({ message: 'Attendance record deleted', record: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
