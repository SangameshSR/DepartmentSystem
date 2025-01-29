document.getElementById('loadAttendance').addEventListener('click', async function() {
    const semester = document.getElementById('semester').value;
    const rollNumber = document.getElementById('rollNumber').value.trim();

    // Validate input
    if (!semester || !rollNumber) {
        alert('Please enter a roll number and select a semester.');
        return;
    }

    try {
        // Fetch attendance data from the backend
        const response = await axios.get(`http://localhost:3006/attendance/subjectwise/${semester}/${rollNumber}`);

        // Clear previous data
        const tableBody = document.getElementById('attendanceTable').querySelector('tbody');
        tableBody.innerHTML = '';

        // Populate the table with new data
        const data = response.data.attendance;
        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3">No data available for the selected roll number and semester.</td></tr>';
            return;
        }

        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.subjectName}</td>
                <td>${row.total}</td>
                <td>${row.presentCount}</td>
            `;
            tableBody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('There was an error fetching the attendance data. Please try again.');
    }
});
