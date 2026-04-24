const router = require('express').Router();
const pool = require('../db');

// GET all communications
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM parent_communications ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET communication by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM parent_communications WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Communication not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create communication
router.post('/', async (req, res) => {
  try {
    const { parent_name, child_name, subject, message, type, status, priority } = req.body;
    const result = await pool.query(
      `INSERT INTO parent_communications (parent_name, child_name, subject, message, type, status, priority, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *`,
      [parent_name, child_name, subject, message, type || 'general', status || 'sent', priority || 'normal']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update communication
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { parent_name, child_name, subject, message, type, status, priority } = req.body;
    const result = await pool.query(
      `UPDATE parent_communications SET parent_name=$1, child_name=$2, subject=$3, message=$4, type=$5, status=$6, priority=$7
       WHERE id=$8 RETURNING *`,
      [parent_name, child_name, subject, message, type, status, priority, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Communication not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE communication
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM parent_communications WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Communication not found' });
    }
    res.json({ message: 'Communication deleted', communication: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
