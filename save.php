<?php
$servername = "localhost"; // Change if necessary
$username = "your_username"; // Your MySQL username
$password = "your_password"; // Your MySQL password
$dbname = "attendance_system"; // Your database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $date = $_POST['date'];
    $attendanceRecords = json_decode($_POST['attendanceRecords'], true);

    foreach ($attendanceRecords as $record) {
        // Get student ID based on roll number
        $stmt = $conn->prepare("SELECT id FROM students WHERE roll_number = ?");
        $stmt->bind_param("s", $record['Roll_Number']);
        $stmt->execute();
        $result = $stmt->get_result();
        $studentId = $result->fetch_assoc()['id'];
        $stmt->close();

        $status = $record['Status'];

        // Insert attendance record
        $stmt = $conn->prepare("INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?)");
        $stmt->bind_param("iss", $studentId, $date, $status);
        $stmt->execute();
        $stmt->close();
    }
    echo "Attendance records saved successfully";
}

$conn->close();
?>
