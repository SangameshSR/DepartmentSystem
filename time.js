let semester1TeacherSchedules = {};
let semester2TeacherSchedules = {};

// Function to add subjects for Semester 1 and Semester 2
function addSubjects(semester) {
    const numSubjects = parseInt(document.getElementById(`num-subjects-sem-${semester}`).value);
    const subjectInputs = document.getElementById(`subject-inputs-sem-${semester}`);
    subjectInputs.innerHTML = ''; // Clear existing inputs

    for (let i = 1; i <= numSubjects; i++) {
        subjectInputs.innerHTML += `
            <label for="subject-${i}-sem-${semester}">Subject ${i}:</label>
            <input type="text" id="subject-${i}-sem-${semester}" placeholder="Enter Subject ${i}" required>
            <label for="teacher-${i}-sem-${semester}">Teacher for Subject ${i}:</label>
            <input type="text" id="teacher-${i}-sem-${semester}" placeholder="Enter Teacher for Subject ${i}" required>
            <label for="classes-per-week-${i}-sem-${semester}">Classes per Week (Subject ${i}):</label>
            <select id="classes-per-week-${i}-sem-${semester}">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
            </select>
        `;
    }
}

// Function to add labs for Semester 1 and Semester 2
function addLabs(semester) {
    const numLabs = parseInt(document.getElementById(`num-labs-sem-${semester}`).value);
    const labInputs = document.getElementById(`lab-inputs-sem-${semester}`);
    labInputs.innerHTML = ''; // Clear existing inputs

    for (let i = 1; i <= numLabs; i++) {
        labInputs.innerHTML += `
            <label for="lab-${i}-sem-${semester}">Lab ${i}:</label>
            <input type="text" id="lab-${i}-sem-${semester}" placeholder="Enter Lab ${i}" required>
            <label for="lab-teacher-${i}-sem-${semester}">Teacher for Lab ${i}:</label>
            <input type="text" id="lab-teacher-${i}-sem-${semester}" placeholder="Enter Teacher for Lab ${i}" required>
            <label for="lab-classes-per-week-${i}-sem-${semester}">Classes per Week (Lab ${i}):</label>
            <select id="lab-classes-per-week-${i}-sem-${semester}">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
            </select>
        `;
    }
}

// Event listeners to add subjects and labs
document.getElementById('add-subjects-sem-1').addEventListener('click', function() {
    addSubjects(1);
});

document.getElementById('add-labs-sem-1').addEventListener('click', function() {
    addLabs(1);
});

document.getElementById('add-subjects-sem-2').addEventListener('click', function() {
    addSubjects(2);
});

document.getElementById('add-labs-sem-2').addEventListener('click', function() {
    addLabs(2);
});

// Event listeners to generate timetables
document.getElementById('generate-timetable-sem-1').addEventListener('click', function() {
    generateTimetable(1);
});

document.getElementById('generate-timetable-sem-2').addEventListener('click', function() {
    generateTimetable(2);
});

// Function to shuffle an array (used for randomizing subject slot assignments)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Helper function to check if a teacher is already scheduled at the same time
function isTeacherAvailable(semester, teacherName, day, timeslot) {
    const schedule = semester === 1 ? semester1TeacherSchedules : semester2TeacherSchedules;
    if (!schedule[teacherName]) schedule[teacherName] = {};
    
    if (!schedule[teacherName][day]) schedule[teacherName][day] = [];

    return !schedule[teacherName][day].includes(timeslot);
}

// Main function to generate the timetable
function generateTimetable(semester) {
    const subjects = [];
    const labs = [];
    const numSubjects = semester === 1 ? parseInt(document.getElementById('num-subjects-sem-1').value) : parseInt(document.getElementById('num-subjects-sem-2').value);
    const numLabs = semester === 1 ? parseInt(document.getElementById('num-labs-sem-1').value) : parseInt(document.getElementById('num-labs-sem-2').value);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']; // Include Saturday

    // Collect subjects and labs data
    for (let i = 1; i <= numSubjects; i++) {
        const subject = document.getElementById(`subject-${i}-sem-${semester}`).value;
        const teacher = document.getElementById(`teacher-${i}-sem-${semester}`).value;
        const classesPerWeek = parseInt(document.getElementById(`classes-per-week-${i}-sem-${semester}`).value);
        subjects.push({ subject, teacher, classesPerWeek });
    }

    for (let i = 1; i <= numLabs; i++) {
        const lab = document.getElementById(`lab-${i}-sem-${semester}`).value;
        const teacher = document.getElementById(`lab-teacher-${i}-sem-${semester}`).value;
        const classesPerWeek = parseInt(document.getElementById(`lab-classes-per-week-${i}-sem-${semester}`).value);
        labs.push({ lab, teacher, classesPerWeek });
    }

    // Create timetable table
    const timetableTable = document.getElementById(`timetable-sem-${semester}`).getElementsByTagName('tbody')[0];
    timetableTable.innerHTML = '';  // Clear existing timetable

    // For each day, generate a schedule with time slots
    for (let day of days) {
        const row = timetableTable.insertRow();
        const dayCell = row.insertCell();
        dayCell.textContent = day;

        const timeslotsBeforeLunch = ['9:00-10:00', '10:00-11:00', '11:15-12:15', '12:15-1:15']; // Only before lunch (excluding break)
        const timeslotAfterLunch = ['2:15-4:15']; // Lab after lunch

        // Shuffle subjects and labs
        shuffleArray(subjects);
        shuffleArray(labs);

        let subjectIndex = 0;
        let labIndex = 0;
        let assignedLabsPerDay = 0;  // Track how many labs are assigned per day

        // Assign subjects to slots before lunch
        timeslotsBeforeLunch.forEach((slot) => {
            const cell = row.insertCell();
            let assigned = false;

            // Try assigning a subject
            if (subjectIndex < subjects.length) {
                const subject = subjects[subjectIndex];
                const teacherName = subject.teacher;
                
                if (isTeacherAvailable(semester, teacherName, day, slot)) {
                    cell.textContent = `${subject.subject} - ${subject.teacher}`;
                    subjectIndex++;
                    assigned = true;

                    if (!semester1TeacherSchedules[teacherName]) semester1TeacherSchedules[teacherName] = {};
                    if (!semester1TeacherSchedules[teacherName][day]) semester1TeacherSchedules[teacherName][day] = [];
                    semester1TeacherSchedules[teacherName][day].push(slot);
                }
            }
        });

        // Assign labs after lunch (only once per week, randomly on different days)
        if (assignedLabsPerDay < 1 && labIndex < labs.length) {
            const lab = labs[labIndex];
            const teacherName = lab.teacher;

            if (isTeacherAvailable(semester, teacherName, day, timeslotAfterLunch[0])) {
                const cell = row.insertCell();
                cell.textContent = `${lab.lab} - ${lab.teacher}`;
                assignedLabsPerDay++;

                if (!semester1TeacherSchedules[teacherName]) semester1TeacherSchedules[teacherName] = {};
                if (!semester1TeacherSchedules[teacherName][day]) semester1TeacherSchedules[teacherName][day] = [];
                semester1TeacherSchedules[teacherName][day].push(timeslotAfterLunch[0]);

                labIndex++;
            }
        }
    }
}
