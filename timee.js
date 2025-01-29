let teacherSchedules = {};
let isEditing = false;
let dailyClassAssignments = {};

function addSubjects(semester) {
    const numSubjects = document.getElementById(`num-subjects-sem-${semester}`).value;
    const subjectInputs = document.getElementById(`subject-inputs-sem-${semester}`);
    subjectInputs.innerHTML = '';

    for (let i = 1; i <= numSubjects; i++) {
        subjectInputs.innerHTML += `
            <div>
                <input type="text" id="subject-${i}-sem-${semester}" placeholder="Subject ${i}" required>
                <input type="text" id="teacher-${i}-sem-${semester}" placeholder="Teacher ${i}" required>
                <select id="classes-per-week-${i}-sem-${semester}">
                    ${[1, 2, 3, 4, 5].map(num => `<option value="${num}">${num}</option>`).join('')}
                </select>
            </div>
        `;
    }
}

function addLabs(semester) {
    const numLabs = document.getElementById(`num-labs-sem-${semester}`).value;
    const labInputs = document.getElementById(`lab-inputs-sem-${semester}`);
    labInputs.innerHTML = '';

    for (let i = 1; i <= numLabs; i++) {
        labInputs.innerHTML += `
            <div>
                <input type="text" id="lab-${i}-sem-${semester}" placeholder="Lab ${i}" required>
                <input type="text" id="lab-teacher-${i}-sem-${semester}" placeholder="Lab Teacher ${i}" required>
                <select id="lab-classes-per-week-${i}-sem-${semester}">
                    ${[1, 2].map(num => `<option value="${num}">${num}</option>`).join('')}
                </select>
            </div>
        `;
    }
}

function generateTimetables() {
    teacherSchedules = {};
    dailyClassAssignments = {};
    const timetable1 = generateTimetable(1);
    const timetable2 = generateTimetable(2);
    const timetable3 = generateTimetable(3);
    
    if (timetable1 && timetable2 && timetable3) {
        displayTimetable(timetable1, 1);
        displayTimetable(timetable2, 2);
        displayTimetable(timetable3, 3);
    } else {
        alert("Unable to generate clash-free timetables. Please try again or adjust inputs.");
    }
}

function generateTimetable(semester) {
    const subjects = getSubjects(semester);
    const labs = getLabs(semester);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const slots = ['9:00-10:00', '10:00-11:00', '11:00-11:15', '11:15-12:15', '12:15-1:15', '1:15-2:15', '2:15-4:15'];

    let timetable = days.map(() => slots.map(() => null));
    let attempts = 0;
    const maxAttempts = 1000;

    while (attempts < maxAttempts) {
        let success = true;

        // Reset the timetable and daily class assignments
        timetable = days.map(() => slots.map(() => null));
        dailyClassAssignments[semester] = days.map(() => ({}));

        // Assign labs
        for (const lab of labs) {
            for (let i = 0; i < lab.classesPerWeek; i++) {
                if (!assignClass(lab, timetable, semester, true)) {
                    success = false;
                    break;
                }
            }
            if (!success) break;
        }

        // Assign subjects
        if (success) {
            for (const subject of subjects) {
                for (let i = 0; i < subject.classesPerWeek; i++) {
                    if (!assignClass(subject, timetable, semester, false)) {
                        success = false;
                        break;
                    }
                }
                if (!success) break;
            }
        }

        if (success) {
            return timetable;
        }

        attempts++;
    }

    return null;
}

function assignClass(classObj, timetable, semester, isLab) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const slots = isLab ? [6] : [0, 1, 3, 4];

    for (let attempt = 0; attempt < 50; attempt++) {
        const day = Math.floor(Math.random() * days.length);
        const slotIndex = slots[Math.floor(Math.random() * slots.length)];

        if (!timetable[day][slotIndex] && 
            !isTeacherBusy(classObj.teacher, day, slotIndex, semester) &&
            !dailyClassAssignments[semester][day][classObj.name]) {
            
            timetable[day][slotIndex] = classObj;
            assignTeacher(classObj.teacher, day, slotIndex, semester);
            dailyClassAssignments[semester][day][classObj.name] = true;
            return true;
        }
    }

    return false;
}

function getSubjects(semester) {
    const subjects = [];
    const numSubjects = document.getElementById(`num-subjects-sem-${semester}`).value;
    for (let i = 1; i <= numSubjects; i++) {
        subjects.push({
            name: document.getElementById(`subject-${i}-sem-${semester}`).value,
            teacher: document.getElementById(`teacher-${i}-sem-${semester}`).value,
            classesPerWeek: parseInt(document.getElementById(`classes-per-week-${i}-sem-${semester}`).value)
        });
    }
    return subjects;
}

function getLabs(semester) {
    const labs = [];
    const numLabs = document.getElementById(`num-labs-sem-${semester}`).value;
    for (let i = 1; i <= numLabs; i++) {
        labs.push({
            name: document.getElementById(`lab-${i}-sem-${semester}`).value,
            teacher: document.getElementById(`lab-teacher-${i}-sem-${semester}`).value,
            classesPerWeek: parseInt(document.getElementById(`lab-classes-per-week-${i}-sem-${semester}`).value)
        });
    }
    return labs;
}

function isTeacherBusy(teacher, day, slot, semester) {
    if (!teacherSchedules[teacher]) {
        teacherSchedules[teacher] = [
            Array(6).fill().map(() => Array(7).fill(false)),
            Array(6).fill().map(() => Array(7).fill(false)),
            Array(6).fill().map(() => Array(7).fill(false))
        ];
    }
    return teacherSchedules[teacher][0][day][slot] || 
           teacherSchedules[teacher][1][day][slot] || 
           teacherSchedules[teacher][2][day][slot];
}

function assignTeacher(teacher, day, slot, semester) {
    if (!teacherSchedules[teacher]) {
        teacherSchedules[teacher] = [
            Array(6).fill().map(() => Array(7).fill(false)),
            Array(6).fill().map(() => Array(7).fill(false)),
            Array(6).fill().map(() => Array(7).fill(false))
        ];
    }
    teacherSchedules[teacher][semester - 1][day][slot] = true;
}

function displayTimetable(timetable, semester) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const slots = ['9:00-10:00', '10:00-11:00', '11:00-11:15', '11:15-12:15', '12:15-1:15', '1:15-2:15', '2:15-4:15'];
    
    let html = `<h2>Semester ${semester} Timetable</h2>`;
    html += '<table>';
    html += '<tr><th>Day/Time</th>' + slots.map(slot => `<th>${slot}</th>`).join('') + '</tr>';
    
    days.forEach((day, dayIndex) => {
        html += `<tr><td>${day}</td>`;
        timetable[dayIndex].forEach((slot, slotIndex) => {
            if (slotIndex === 2) {
                html += '<td class="break">Short Break</td>';
            } else if (slotIndex === 5) {
                html += '<td class="break">Lunch Break</td>';
            } else if (slotIndex === 6) {
                html += `<td class="lab" data-semester="${semester}" data-day="${dayIndex}" data-slot="${slotIndex}">${slot ? `${slot.name}<br>${slot.teacher}` : 'No Lab'}</td>`;
            } else {
                html += `<td data-semester="${semester}" data-day="${dayIndex}" data-slot="${slotIndex}">${slot ? `${slot.name}<br>${slot.teacher}` : ''}</td>`;
            }
        });
        html += '</tr>';
    });
    
    html += '</table>';
    document.getElementById(`timetable-sem-${semester}`).innerHTML = html;
}

function saveTimetables() {
    const timetables = document.querySelectorAll('#timetables-container > div');
    let timetablesData = '';

    timetables.forEach((timetable, index) => {
        timetablesData += `Semester ${index + 1} Timetable\n\n`;
        timetablesData += timetable.innerText;
        timetablesData += '\n\n';
    });

    const blob = new Blob([timetablesData], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'timetables.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function printTimetables() {
    const printContent = document.getElementById('timetables-container').innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    
    // Reattach event listeners
    attachEventListeners();
}

function enableEditing() {
    isEditing = true;
    const cells = document.querySelectorAll('td[data-semester]');
    cells.forEach(cell => {
        cell.classList.add('editable');
        cell.onclick = function() {
            if (isEditing) {
                const newContent = prompt('Enter new content (Subject Name<br>Teacher Name):');
                if (newContent) {
                    this.innerHTML = newContent;
                }
            }
        };
    });
}

function attachEventListeners() {
    document.querySelector('button[onclick="generateTimetables()"]').onclick = generateTimetables;
    document.querySelector('button[onclick="printTimetables()"]').onclick = printTimetables;
    document.querySelector('button[onclick="saveTimetables()"]').onclick = saveTimetables;
    document.querySelector('button[onclick="enableEditing()"]').onclick = enableEditing;
    
    for (let i = 1; i <= 3; i++) {
        document.querySelector(`button[onclick="addSubjects(${i})"]`).onclick = () => addSubjects(i);
        document.querySelector(`button[onclick="addLabs(${i})"]`).onclick = () => addLabs(i);
    }
}

// Initialize the inputs
addSubjects(1);
addLabs(1);
addSubjects(2);
addLabs(2);
addSubjects(3);
addLabs(3);

attachEventListeners();

