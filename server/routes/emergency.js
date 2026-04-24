const router = require('express').Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM emergency_contacts ORDER BY child_name, priority_order');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM emergency_contacts WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { child_name, contact_name, relationship, phone, alt_phone, email, address, authorized_pickup, priority_order, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO emergency_contacts (child_name, contact_name, relationship, phone, alt_phone, email, address, authorized_pickup, priority_order, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [child_name, contact_name, relationship, phone, alt_phone, email, address, authorized_pickup ?? true, priority_order || 1, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { child_name, contact_name, relationship, phone, alt_phone, email, address, authorized_pickup, priority_order, notes } = req.body;
    const result = await pool.query(
      `UPDATE emergency_contacts SET child_name=$1, contact_name=$2, relationship=$3, phone=$4, alt_phone=$5, email=$6, address=$7, authorized_pickup=$8, priority_order=$9, notes=$10
       WHERE id=$11 RETURNING *`,
      [child_name, contact_name, relationship, phone, alt_phone, email, address, authorized_pickup, priority_order, notes, req.params.id]
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
    const result = await pool.query('DELETE FROM emergency_contacts WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', record: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
