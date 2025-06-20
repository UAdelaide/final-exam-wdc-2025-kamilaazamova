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
        INSERT IGNORE INTO Users (username, email, password_hash, role) VALUES
            ('alice123', 'alice@example.com', 'hashed123', 'owner'),
            ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
            ('carol123', 'carol@example.com', 'hashed789', 'owner'),
            ('torivega', 'toriv@example.com', 'hashed987', 'walker'),
            ('trinavega', 'trinav@example.com', 'hashed321', 'owner')
        `);

    await db.execute(`
        INSERT IGNORE INTO Dogs(owner_id, name, size) VALUES
            ((SELECT user_id FROM Users WHERE username = 'alice123'), 'Max', 'medium'),
            ((SELECT user_id FROM Users WHERE username = 'carol123'), 'Bella', 'small'),
            ((SELECT user_id FROM Users WHERE username = 'trinavega'), 'Maurice', 'large'),
            ((SELECT user_id FROM Users WHERE username = 'alice123'), 'Julian', 'small'),
            ((SELECT user_id FROM Users WHERE username = 'trinavega'), 'Smudge', 'medium')
        `);

    await db.execute(`
        INSERT IGNORE INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES
            ((SELECT dog_id FROM Dogs WHERE name = 'Max'), '2025-06-10 08:00:00', 30, 'Parklands', 'open'),
            ((SELECT dog_id FROM Dogs WHERE name = 'Bella'), '2025-06-10 09:30:00', 45, 'Beachside Avenue', 'accepted'),
            ((SELECT dog_id FROM Dogs WHERE name = 'Maurice'), '2025-06-11 09:45:00', 50, 'Madagascarian Jungle', 'open'),
            ((SELECT dog_id FROM Dogs WHERE name = 'Julian'), '2025-07-12 10:10:00', 40, 'Madagascars Beach', 'accepted'),
            ((SELECT dog_id FROM Dogs WHERE name = 'Smudge'), '2025-07-15 11:11:11', 35, 'Brighton Beach', 'completed')
        `);

    await db.execute(`
        INSERT IGNORE  WalkRatings (walker_id, rating) VALUES
            ((SELECT user_id FROM Users WHERE username = 'bobwalker'), 4),
            ((SELECT user_id FROM Users WHERE username = 'bobwalker'), 5)
        `);

    console.log('Successfully connected to the database and the test data was inserted!!');
  } catch (err) {
    console.error('Oh nooo an error setting up sorry!!!', err);
  }
})();

//  now we do the routes

// api/dogs
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

// api/walkrequests/open
app.get('/api/walkrequests/open', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT wr.request_id,
                    Dogs.name AS dog_name,
                    wr.requested_time,
                    wr.duration_minutes,
                    wr.location,
                    Users.username AS owner_username
            FROM WalkRequests wr JOIN Dogs ON wr.dog_id = Dogs.dog_id
            JOIN Users ON Dogs.owner_id = Users.user_id
            WHERE wr.status = 'open'
            `);
            res.json(rows);
    } catch (err) {
        console.error('Sorry! Error found in the api/walkrequests/open route: ', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// api/walkers/summary
app.get('/api/walkers/summary', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT u.username AS walker_username,
                COUNT(wr.rating) AS total_ratings,
                AVG(wr.rating) AS average_rating,
                COUNT(wr.rating) AS completed_walks
            FROM Users u
            LEFT JOIN WalkRatings wr ON u.user_id = wr.walker_id
            WHERE u.role = 'walker'
            GROUP BY u.user_id, u.username
            `);
            res.json(rows);
    } catch (err) {
        console.error('Sorry! Error found in the api/walkers/summary route: ', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;
