const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const moment = require('moment'); // To handle dates more efficiently

const app = express();
const PORT = 3006;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Database Connection
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
    console.log('Connected to MySQL database for Dashboard');
});

// Helper Function: Execute MySQL Queries
const executeQuery = (query, params) => {
    return new Promise((resolve, reject) => {
        db.query(query, params, (err, results) => {
            if (err) {
                console.error('Query execution failed:', err);
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

// Route to get subject-wise attendance data for a specific student and semester
app.get('/attendance/subjectwise/:semester/:studentId', async (req, res) => {
    const { semester, studentId } = req.params;

    // Validate inputs
    if (!semester || !studentId) {
        return res.status(400).json({ message: "Invalid semester or studentId." });
    }

    // Convert semester to date range (assuming semester 1 = Jan to May, semester 2 = Jun to Dec)
    const startDate = semester === '1' ? `${moment().year()}-01-01` : `${moment().year()}-06-01`;
    const endDate = semester === '1' ? `${moment().year()}-05-31` : `${moment().year()}-12-31`;

    try {
        // Query to get subject-wise attendance for a student in a given semester
        const attendanceData = await executeQuery(
            `SELECT subjectName, COUNT(*) AS total, 
                SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) AS presentCount 
            FROM attendance 
            WHERE roll_number = ? AND date BETWEEN ? AND ? 
            GROUP BY subjectName`,
            [studentId, startDate, endDate]
        );

        // Handle case when no data is found
        if (attendanceData.length === 0) {
            return res.status(404).json({ message: 'No attendance data found for this student and semester.' });
        }

        // Respond with attendance data
        res.json({ attendance: attendanceData });
    } catch (err) {
        // Log detailed error and return a generic message to the client
        console.error('Error fetching subject-wise attendance:', err);
        res.status(500).json({ message: 'Error fetching attendance data. Please try again later.', error: err.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Dashboard server running on http://localhost:${PORT}`);
});
