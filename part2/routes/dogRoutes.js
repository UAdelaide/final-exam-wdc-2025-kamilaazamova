const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT Dogs.dog_id, Dogs.name AS dog_name, Dogs.size, Users.username AS owner_username
      FROM Dogs JOIN Users ON Dogs.owner_id = Users.user_id
    `);
    res.json(rows);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
