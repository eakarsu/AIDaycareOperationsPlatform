const router = require('express').Router();
const pool = require('../db');

// GET all meal plans
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM meal_plans ORDER BY date DESC, id');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET meal plan by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM meal_plans WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Meal plan not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create meal plan
router.post('/', async (req, res) => {
  try {
    const { meal_name, meal_type, date, age_group, description, calories, allergens, servings, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO meal_plans (meal_name, meal_type, date, age_group, description, calories, allergens, servings, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [meal_name, meal_type, date, age_group, description, calories, allergens, servings, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update meal plan
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { meal_name, meal_type, date, age_group, description, calories, allergens, servings, notes } = req.body;
    const result = await pool.query(
      `UPDATE meal_plans SET meal_name=$1, meal_type=$2, date=$3, age_group=$4, description=$5, calories=$6, allergens=$7, servings=$8, notes=$9
       WHERE id=$10 RETURNING *`,
      [meal_name, meal_type, date, age_group, description, calories, allergens, servings, notes, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Meal plan not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE meal plan
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM meal_plans WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Meal plan not found' });
    }
    res.json({ message: 'Meal plan deleted', meal: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
