const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = 3006;

// Middleware
app.use(cors());
app.use(express.json());

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));  // Make sure you have a 'views' folder

// Serve static files (like CSS)
app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Rahul@123',
    database: 'studentdb'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Email Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'diggaviprajwal55@gmail.com',
        pass: 'bgnm kbga xkew pgpb' // Use app-specific password
    }
});

// Helper Function: Execute MySQL Queries
const executeQuery = (query, params) => {
    return new Promise((resolve, reject) => {
        db.query(query, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};

// Dashboard Route
app.get('/dashboard', async (req, res) => {
    try {
        // Fetch total number of students
        const totalStudents = await executeQuery('SELECT COUNT(*) AS total FROM students');
        
        // Fetch total attendance records
        const totalAttendance = await executeQuery('SELECT COUNT(*) AS total FROM attendance');

        // Fetch subjects covered (distinct subject names)
        const subjectsCovered = await executeQuery('SELECT COUNT(DISTINCT subjectName) AS total FROM attendance');

        // Fetch recent attendance records (last 5 attendance records)
        const recentAttendance = await executeQuery(
            'SELECT studentName, status, subjectName, date FROM attendance JOIN students ON attendance.roll_number = students.studentId ORDER BY date DESC LIMIT 5'
        );

        // Render the dashboard
        res.render('dashboard', {  // Ensure 'dashboard.ejs' exists inside the 'views' folder
            totalStudents: totalStudents[0].total,
            totalAttendance: totalAttendance[0].total,
            subjectsCovered: subjectsCovered[0].total,
            recentAttendance: recentAttendance
        });
    } catch (err) {
        console.error('Error fetching dashboard data:', err);
        res.status(500).send('Error fetching dashboard data');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
