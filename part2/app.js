const express = require('express');
const session = require('express-session'); // added
const bodyParser = require('body-parser'); // added
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

app.use(bodyParser.urlencoded({ entended: true}));
app.use(session({
    secret: ''
}))

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// Export the app instead of listening here
module.exports = app;