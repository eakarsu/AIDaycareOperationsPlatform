const router = require('express').Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM immunizations ORDER BY child_name, date_administered DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM immunizations WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { child_name, vaccine_name, dose_number, date_administered, administered_by, next_due_date, status, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO immunizations (child_name, vaccine_name, dose_number, date_administered, administered_by, next_due_date, status, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [child_name, vaccine_name, dose_number, date_administered, administered_by, next_due_date, status || 'up_to_date', notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { child_name, vaccine_name, dose_number, date_administered, administered_by, next_due_date, status, notes } = req.body;
    const result = await pool.query(
      `UPDATE immunizations SET child_name=$1, vaccine_name=$2, dose_number=$3, date_administered=$4, administered_by=$5, next_due_date=$6, status=$7, notes=$8
       WHERE id=$9 RETURNING *`,
      [child_name, vaccine_name, dose_number, date_administered, administered_by, next_due_date, status, notes, req.params.id]
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
    const result = await pool.query('DELETE FROM immunizations WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', record: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
