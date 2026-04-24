const router = require('express').Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM activities ORDER BY date DESC, time');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM activities WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { activity_name, activity_type, date, time, duration, age_group, classroom, description, materials_needed, learning_objectives, led_by, status } = req.body;
    const result = await pool.query(
      `INSERT INTO activities (activity_name, activity_type, date, time, duration, age_group, classroom, description, materials_needed, learning_objectives, led_by, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [activity_name, activity_type, date, time, duration, age_group, classroom, description, materials_needed, learning_objectives, led_by, status || 'planned']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { activity_name, activity_type, date, time, duration, age_group, classroom, description, materials_needed, learning_objectives, led_by, status } = req.body;
    const result = await pool.query(
      `UPDATE activities SET activity_name=$1, activity_type=$2, date=$3, time=$4, duration=$5, age_group=$6, classroom=$7, description=$8, materials_needed=$9, learning_objectives=$10, led_by=$11, status=$12
       WHERE id=$13 RETURNING *`,
      [activity_name, activity_type, date, time, duration, age_group, classroom, description, materials_needed, learning_objectives, led_by, status, req.params.id]
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
    const result = await pool.query('DELETE FROM activities WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', record: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
