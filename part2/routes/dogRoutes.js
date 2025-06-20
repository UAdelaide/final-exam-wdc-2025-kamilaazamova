// file for question 15
const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all the dogs for the logged in owner
router.get('/owners-dogs', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'owner') {
        return res.
    }
});

module.exports = router;