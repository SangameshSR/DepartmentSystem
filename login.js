const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

// Initialize Express app
const app = express();
const PORT = 3008;

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Rahul@123', // Replace with your MySQL password
    database: 'studentdb', // Replace with your database name
});

// Connect to MySQL
db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
        process.exit(1); // Exit if connection fails
    } else {
        console.log('Connected to the MySQL database.');
    }
});

// Middleware to parse JSON
app.use(bodyParser.json());

// Route for user registration
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
        db.query(query, [name, email, hashedPassword], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ message: 'Email already exists.' });
                }
                console.error('Error inserting user:', err.message);
                return res.status(500).json({ message: 'Error registering user.' });
            }
            res.status(201).json({ message: 'User registered successfully.' });
        });
    } catch (error) {
        console.error('Error hashing password:', error.message);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Route for user login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user by email
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error('Error fetching user:', err.message);
            return res.status(500).json({ message: 'Error logging in.' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const user = results[0];

        // Compare password with hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Successful login
        res.status(200).json({ message: 'Login successful.' });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
