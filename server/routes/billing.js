const router = require('express').Router();
const pool = require('../db');

// GET all billing records
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM billing ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET billing by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM billing WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Billing record not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create billing record
router.post('/', async (req, res) => {
  try {
    const { parent_name, child_name, amount, description, status, due_date, invoice_number, payment_method } = req.body;
    const result = await pool.query(
      `INSERT INTO billing (parent_name, child_name, amount, description, status, due_date, invoice_number, payment_method)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [parent_name, child_name, amount, description, status || 'pending', due_date, invoice_number, payment_method]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update billing record
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { parent_name, child_name, amount, description, status, due_date, invoice_number, payment_method } = req.body;
    const result = await pool.query(
      `UPDATE billing SET parent_name=$1, child_name=$2, amount=$3, description=$4, status=$5, due_date=$6, invoice_number=$7, payment_method=$8
       WHERE id=$9 RETURNING *`,
      [parent_name, child_name, amount, description, status, due_date, invoice_number, payment_method, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Billing record not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE billing record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM billing WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Billing record not found' });
    }
    res.json({ message: 'Billing record deleted', record: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
