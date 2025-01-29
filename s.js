const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const PORT = 3006;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Basu@123',
    database: 'newschema'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
    console.log('Connected to MySQL database');
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

// Route: Dashboard Data by Roll Number
app.get('/dashboard/:rollNumber', async (req, res) => {
    const { rollNumber } = req.params;

    try {
        const studentQuery = `SELECT * FROM students WHERE studentId = ?`;
        const studentData = await executeQuery(studentQuery, [rollNumber]);

        if (studentData.length === 0) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        const student = studentData[0];

        // Fetch subject-wise attendance data
        const attendanceQuery = `
            SELECT subjectName, 
                COUNT(CASE WHEN status = 'Present' THEN 1 END) AS totalPresent,
                COUNT(CASE WHEN status = 'Absent' THEN 1 END) AS totalAbsent
            FROM attendance
            WHERE roll_number = ?
            GROUP BY subjectName
        `;
        const attendanceData = await executeQuery(attendanceQuery, [rollNumber]);

        // Fetch total attendance percentage
        const totalAttendanceQuery = `
            SELECT COUNT(*) AS totalClasses,
                COUNT(CASE WHEN status = 'Present' THEN 1 END) AS totalPresent
            FROM attendance
            WHERE roll_number = ?
        `;
        const totalAttendance = await executeQuery(totalAttendanceQuery, [rollNumber]);

        const totalPercentage =
            (totalAttendance[0]?.totalPresent / totalAttendance[0]?.totalClasses) * 100 || 0;

        // Send the response data
        res.json({
            studentDetails: student,
            attendance: attendanceData,
            totalPercentage: totalPercentage.toFixed(2),
            totalClasses: totalAttendance[0]?.totalClasses || 0
        });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
});

// Route: Total Students
app.get('/total-students', async (req, res) => {
    try {
        const query = `SELECT COUNT(*) AS totalStudents FROM students`;
        const result = await executeQuery(query);
        res.json({ totalStudents: result[0]?.totalStudents || 0 });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
