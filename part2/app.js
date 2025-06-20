var express = require('express');
var session = require('express-session'); // added
var bodyParser = require('body-parser'); // added
var path = require('path');
var mysql = require('mysql2/promise');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

// use sessions
app.use(bodyParser.urlencoded({ extended: true}));
app.use(session({
    secret: 'tempKey',
    resave: false,
    saveUninitialized: false
}));

let db;

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

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// Export the app instead of listening here
module.exports = app;
