// server.js or app.js

const express = require('express');
const cors = require('cors');  // Import CORS
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Initialize Express app
const app = express();
const port = 3008;

// Enable CORS for all domains (or specify your frontend domain)
app.use(cors());  // This will allow all origins, you can restrict to 'http://127.0.0.1:5500' if needed
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',  // Update with your MySQL user
    password: 'Basu@123',  // Your MySQL password
    database: 'newschema',  // Database name
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to the database');
});

// Register Route
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save the user to the database
        db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword], (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Error registering user' });
            }
            res.status(201).json({ message: 'User registered successfully' });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Login Route
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate a token (optional)
        const token = jwt.sign({ userId: user.id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
