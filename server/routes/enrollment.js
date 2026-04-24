const router = require('express').Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM enrollments ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM enrollments WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { child_name, parent_name, parent_email, parent_phone, date_of_birth, age_group, enrollment_date, status, classroom, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO enrollments (child_name, parent_name, parent_email, parent_phone, date_of_birth, age_group, enrollment_date, status, classroom, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [child_name, parent_name, parent_email, parent_phone, date_of_birth, age_group, enrollment_date, status || 'active', classroom, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { child_name, parent_name, parent_email, parent_phone, date_of_birth, age_group, enrollment_date, status, classroom, notes } = req.body;
    const result = await pool.query(
      `UPDATE enrollments SET child_name=$1, parent_name=$2, parent_email=$3, parent_phone=$4, date_of_birth=$5, age_group=$6, enrollment_date=$7, status=$8, classroom=$9, notes=$10
       WHERE id=$11 RETURNING *`,
      [child_name, parent_name, parent_email, parent_phone, date_of_birth, age_group, enrollment_date, status, classroom, notes, req.params.id]
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
    const result = await pool.query('DELETE FROM enrollments WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', record: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
