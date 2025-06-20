var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql2/promise');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

let db;

(async () => {
  try {
    // Connect to DogWalkService database
    db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '', // Set mysql root password
      database: 'DogWalkService'
    });

    // now we insert test data for api endpoints
    // first three taken from that previous question
    // then need to complete other 2 tables
    await db.execute(`
        INSERT INTO Users (username, email, password_hash, role) VALUES
        ('alice123', 'alice@example.com', 'hashed123', 'owner'),
        ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
        ('carol123', 'carol@example.com', 'hashed789', 'owner'),
        ('torivega', 'toriv@example.com', 'hashed987', 'walker'),
        ('trinavega', 'trinav@example.com', 'hashed321', 'owner');
        `);

    await db.execute(`
        INSERT IGNORE INTO Dogs(owner_id, name, size) VALUES
            ((SELECT user_id FROM Users WHERE username = 'alice123'), 'Max', 'medium'),
            ((SELECT user_id FROM Users WHERE username = 'carol123'), 'Bella', 'small'),
            ((SELECT user_id FROM Users WHERE username = 'trinavega'), 'Maurice', 'large'),
            ((SELECT user_id FROM Users WHERE username = 'alice123'), 'Julian', 'small'),
            ((SELECT user_id FROM Users WHERE username = 'trinavega'), 'Smudge', 'medium');
        `);




app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;
