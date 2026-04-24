const router = require('express').Router();
const pool = require('../db');

// GET all incidents
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM incidents ORDER BY date DESC, id');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET incident by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM incidents WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create incident
router.post('/', async (req, res) => {
  try {
    const { child_name, incident_type, description, severity, date, time, location, action_taken, reported_by, parent_notified } = req.body;
    const result = await pool.query(
      `INSERT INTO incidents (child_name, incident_type, description, severity, date, time, location, action_taken, reported_by, parent_notified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [child_name, incident_type, description, severity || 'low', date, time, location, action_taken, reported_by, parent_notified || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update incident
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { child_name, incident_type, description, severity, date, time, location, action_taken, reported_by, parent_notified } = req.body;
    const result = await pool.query(
      `UPDATE incidents SET child_name=$1, incident_type=$2, description=$3, severity=$4, date=$5, time=$6, location=$7, action_taken=$8, reported_by=$9, parent_notified=$10
       WHERE id=$11 RETURNING *`,
      [child_name, incident_type, description, severity, date, time, location, action_taken, reported_by, parent_notified, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE incident
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM incidents WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.json({ message: 'Incident deleted', incident: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
