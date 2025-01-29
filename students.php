<?php
$servername = "localhost"; // Change if necessary
$username = "root"; // Your MySQL username
$password = "Rahul@123"; // Your MySQL password
$dbname = "attendance_system"; // Your database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get data from POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'];
    $roll_number = $_POST['roll_number'];
    $semester = $_POST['semester'];

    // Insert student into database
    $stmt = $conn->prepare("INSERT INTO students (name, roll_number, semester) VALUES (?, ?, ?)");
    $stmt->bind_param("ssi", $name, $roll_number, $semester);
    
    if ($stmt->execute()) {
        echo "New student added successfully";
    } else {
        echo "Error: " . $stmt->error;
    }
    $stmt->close();
}

$conn->close();
?>
