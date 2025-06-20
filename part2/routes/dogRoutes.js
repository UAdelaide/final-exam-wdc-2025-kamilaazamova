// file for question 15
const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all the dogs for the logged in owner
router.get('/my-dogs', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'owner') {
        return res.status(401).json({ error: 'Wrong user role'});
    }

    try {
        const [rows] = await db.query(`
            SELECT dog_id, name FROM Dogs WHERE owner_id = ?
            `, [req.session.user.owner_id]);

            res.json(rows);
    } catch (err) {
        console.error('Failed to fetch dogs: ', err);
        res.status(500).json({ error: 'server error'});
    }
});

module.exports = router;