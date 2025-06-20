const express = require('express');
const session = require('express-session'); // added
const bodyParser = require('body-parser'); // added
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

// use sessions
app.use(bodyParser.urlencoded({ entended: true}));
app.use(session({
    secret: 'tempKey',
    resave: false,
    saveUninitialised: false
}));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

app.get('/api/dogs', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT Dogs.name AS dog_name, Dogs.size, Users.username AS owner_username
            FROM Dogs JOIN Users ON Dogs.owner_id = Users.user_id
            `);
            res.json(rows);
    } catch (err) {
        console.error('Sorry! Error found in the api/dogs route: ', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Export the app instead of listening here
module.exports = app;