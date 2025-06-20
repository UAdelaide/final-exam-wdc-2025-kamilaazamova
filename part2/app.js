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

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// Export the app instead of listening here
module.exports = app;
