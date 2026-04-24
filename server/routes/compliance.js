const router = require('express').Router();
const pool = require('../db');

// GET all compliance records
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM licensing_compliance ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET compliance by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM licensing_compliance WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Compliance record not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create compliance record
router.post('/', async (req, res) => {
  try {
    const { requirement, category, status, due_date, responsible_person, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO licensing_compliance (requirement, category, status, due_date, responsible_person, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [requirement, category, status || 'pending', due_date, responsible_person, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update compliance record
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { requirement, category, status, due_date, responsible_person, notes } = req.body;
    const result = await pool.query(
      `UPDATE licensing_compliance SET requirement=$1, category=$2, status=$3, due_date=$4, responsible_person=$5, notes=$6
       WHERE id=$7 RETURNING *`,
      [requirement, category, status, due_date, responsible_person, notes, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Compliance record not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE compliance record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM licensing_compliance WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Compliance record not found' });
    }
    res.json({ message: 'Compliance record deleted', record: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
