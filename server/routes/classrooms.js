const router = require('express').Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM classrooms');
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await pool.query('SELECT * FROM classrooms ORDER BY id LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM classrooms WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, age_group, capacity, current_count, lead_teacher, assistant_teacher, room_number, status, description, notes } = req.body;

    if (!name || !age_group || !capacity) {
      return res.status(400).json({ error: 'name, age_group, and capacity are required' });
    }

    const result = await pool.query(
      `INSERT INTO classrooms (name, age_group, capacity, current_count, lead_teacher, assistant_teacher, room_number, status, description, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [name, age_group, capacity, current_count || 0, lead_teacher, assistant_teacher, room_number, status || 'active', description, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, age_group, capacity, current_count, lead_teacher, assistant_teacher, room_number, status, description, notes } = req.body;
    const result = await pool.query(
      `UPDATE classrooms SET name=$1, age_group=$2, capacity=$3, current_count=$4, lead_teacher=$5, assistant_teacher=$6, room_number=$7, status=$8, description=$9, notes=$10
       WHERE id=$11 RETURNING *`,
      [name, age_group, capacity, current_count, lead_teacher, assistant_teacher, room_number, status, description, notes, req.params.id]
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
    const result = await pool.query('DELETE FROM classrooms WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', record: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
