const router = require('express').Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM supply_inventory ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM supply_inventory WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { item_name, category, quantity, unit, reorder_level, cost_per_unit, supplier, location, status, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO supply_inventory (item_name, category, quantity, unit, reorder_level, cost_per_unit, supplier, location, status, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [item_name, category, quantity, unit, reorder_level, cost_per_unit, supplier, location, status || 'in_stock', notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { item_name, category, quantity, unit, reorder_level, cost_per_unit, supplier, location, status, notes } = req.body;
    const result = await pool.query(
      `UPDATE supply_inventory SET item_name=$1, category=$2, quantity=$3, unit=$4, reorder_level=$5, cost_per_unit=$6, supplier=$7, location=$8, status=$9, notes=$10
       WHERE id=$11 RETURNING *`,
      [item_name, category, quantity, unit, reorder_level, cost_per_unit, supplier, location, status, notes, req.params.id]
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
    const result = await pool.query('DELETE FROM supply_inventory WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', record: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
