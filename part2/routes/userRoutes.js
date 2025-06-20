const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { render } = require('../app');

// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST a new user (simple signup)
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const [result] = await db.query(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, [username, email, password, role]);

    res.status(201).json({ message: 'User registered', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user);
});

// POST login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query(`
      SELECT user_id, username, role FROM Users
      WHERE email = ? AND password_hash = ?
    `, [email, password]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    req.session.user = {
      id: user.user_id,
      username: user.username,
      role: user.role
    };

    // once logged in redirect to the correct dashboard
    if (user.role === 'owner') {
      return res.redirect('/owner-dashboard.html');
    }

    if (user.role === 'walker') {
      return res.redirect('/walker-dashboard.html');
    }

    return res.status(400).send('Invalid role');

  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// adding logout route
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error: ', err);
      return res.status(500).send('Logout failed!');
    }

    // manually clearing cooke
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

// GET all the dogs for the logged in owner
router.get('/my-dogs', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'owner') {
        return res.status(401).json({ error: 'Wrong user role'});
    }

    try {
        const [rows] = await db.query(`
            SELECT dog_id, name FROM Dogs WHERE owner_id = ?
            `, [req.session.user.id]);

            res.json(rows);
    } catch (err) {
        console.error('Failed to fetch dogs: ', err);
        res.status(500).json({ error: 'server error'});
    }
});

module.exports = router;