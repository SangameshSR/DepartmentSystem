const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3001;

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

// Route to save or update attendance and send email notifications
app.post('/attendance', async (req, res) => {
    const { date, subjectName, attendance } = req.body;

    if (!date || !subjectName || !attendance || attendance.length === 0) {
        return res.status(400).json({ message: "Invalid or incomplete data provided." });
    }

    try {
        const rollNumbers = attendance.map(record => record.roll_number);

        // Save or update attendance records
        const attendancePromises = attendance.map(async (record) => {
            const { roll_number, status } = record;

            const existingRecord = await executeQuery(
                'SELECT id FROM attendance WHERE date = ? AND roll_number = ?',
                [date, roll_number]
            );

            if (existingRecord.length > 0) {
                // Update if record exists
                return executeQuery(
                    'UPDATE attendance SET status = ?, subjectName = ? WHERE date = ? AND roll_number = ?',
                    [status, subjectName, date, roll_number]
                );
            } else {
                // Insert new record if not exists
                return executeQuery(
                    'INSERT INTO attendance (date, roll_number, status, subjectName) VALUES (?, ?, ?, ?)',
                    [date, roll_number, status, subjectName]
                );
            }
        });

        await Promise.all(attendancePromises);

        // Fetch email details and attendance summary
        const students = await executeQuery(
            'SELECT email, studentName, studentId FROM students WHERE studentId IN (?)',
            [rollNumbers]
        );

        const attendanceSummaries = await Promise.all(
            rollNumbers.map(async (rollNumber) => {
                const presentCount = await executeQuery(
                    'SELECT COUNT(*) AS total FROM attendance WHERE roll_number = ? AND subjectName = ? AND status = "Present"',
                    [rollNumber, subjectName]
                );
                return { rollNumber, total: presentCount[0]?.total || 0 };
            })
        );

        // Map students and attendance summaries
        const studentMap = students.reduce((acc, student) => {
            acc[student.studentId] = student;
            return acc;
        }, {});

        const attendanceMap = attendanceSummaries.reduce((acc, summary) => {
            acc[summary.rollNumber] = summary.total;
            return acc;
        }, {});

        // Collect email sending promises
     // Collect email sending promises
const emailPromises = attendance
    .filter(record => studentMap[record.roll_number]) // Ensure valid mapping
    .map(record => {
        const student = studentMap[record.roll_number];
        const totalAttendance = attendanceMap[record.roll_number] || 0;
        
        // Format the date received from the attendance submission
        const formattedDate = new Date(date).toLocaleDateString(); // Ensure the correct date format

        const statusMessage = record.status === 'Present'
            ? `You are marked as Present for ${subjectName} on ${formattedDate}.`
            : `You are marked as Absent for ${subjectName} on ${formattedDate}.`;

        const mailOptions = {
            from: 'diggaviprajwal55@gmail.com',
            to: student.email,
            subject: 'Attendance Status',
            text: `Dear ${student.studentName},\n\n${statusMessage}\n\nYour total Present classes for ${subjectName} is ${totalAttendance}.\n\nRegards,\nDEPT OF ISE BLDEACET`
        };

        return transporter.sendMail(mailOptions);
    });


        await Promise.all(emailPromises);

        res.json({ message: 'Attendance saved and emails sent successfully' });
    } catch (err) {
        console.error('Error saving attendance:', err);
        res.status(500).json({ message: 'Error saving attendance', error: err.message });
    }
});

// Route to get attendance data for a specific student and subject
app.get('/attendance/:studentId/:subjectName', async (req, res) => {
    const { studentId, subjectName } = req.params;

    if (!studentId || !subjectName) {
        return res.status(400).json({ message: "Invalid studentId or subjectName." });
    }

    try {
        const attendanceData = await executeQuery(
            'SELECT * FROM attendance WHERE roll_number = ? AND subjectName = ? AND status = "Present"',
            [studentId, subjectName]
        );

        if (attendanceData.length === 0) {
            return res.status(404).json({ message: 'Attendance data not found' });
        }

        res.json({ attendance: attendanceData });
    } catch (err) {
        console.error('Error fetching attendance:', err);
        res.status(500).json({ message: 'Error fetching attendance', error: err.message });
    }
});

// Route to get students by semester
app.get('/students/semester/:semester', async (req, res) => {
    const { semester } = req.params;

    if (!semester) {
        return res.status(400).json({ message: "Semester not provided." });
    }

    try {
        const students = await executeQuery(
            'SELECT * FROM students WHERE semester = ?',
            [semester]
        );

        if (students.length === 0) {
            return res.status(404).json({ message: 'No students found for this semester.' });
        }

        res.json({ students });
    } catch (err) {
        console.error('Error fetching students by semester:', err);
        res.status(500).json({ message: 'Error fetching students', error: err.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
