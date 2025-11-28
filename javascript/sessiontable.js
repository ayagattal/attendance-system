// ============================================================
// sessiontable.js — Attendance taking
// ============================================================

// Read URL parameters
const urlParams = new URLSearchParams(window.location.search);
const moduleId = urlParams.get("module_id");
const groupId = urlParams.get("group_id");
const sessionNumber = urlParams.get("session");

// DOM
const tbody = document.getElementById("sessionTableBody");

// Store session_id for later use
let currentSessionId = null;

// ============================================================
// LOAD AND RENDER TABLE
// ============================================================

async function loadAndRender() {
    if (!groupId || !sessionNumber) {
        tbody.innerHTML = `<tr><td colspan="5">Missing group_id or session parameter</td></tr>`;
        return;
    }

    try {
        // Load sessions to map session_number to session_id
        const sessionsRes = await fetch(`/attendance_app/api/sessions.php?group_id=${encodeURIComponent(groupId)}`);
        const sessions = await sessionsRes.json();
        
        const sessionObj = sessions.find(s => s.session_number === parseInt(sessionNumber));
        if (!sessionObj) {
            tbody.innerHTML = `<tr><td colspan="5">Session not found</td></tr>`;
            return;
        }
        currentSessionId = sessionObj.session_id;

        // Load students for this group
        const studentsRes = await fetch(`/attendance_app/api/students.php?group_id=${encodeURIComponent(groupId)}`);
        const students = await studentsRes.json();

        // Load attendance for this session/group
        const attendanceRes = await fetch(`/attendance_app/api/attendance_get.php?group_id=${encodeURIComponent(groupId)}`);
        const allAttendance = await attendanceRes.json();

        // Filter attendance for this session only
        const sessionAttendance = allAttendance.filter(a => a.session_number === parseInt(sessionNumber));

        // Build map: student_id -> status (0=absent, 1=present, 2=participated)
        const attendanceMap = {};
        sessionAttendance.forEach(a => {
            attendanceMap[a.student_id] = a.status || 0;
        });

        // Render table rows
        tbody.innerHTML = "";
        students.forEach(student => {
            const status = attendanceMap[student.student_id] || 0;
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${student.first_name} ${student.last_name}</td>
                <td>
                    <input type="radio" name="attendance_${student.student_id}" value="0" 
                        ${status === 0 ? "checked" : ""} onchange="markAttendance(${student.student_id}, 0)">
                    Absent
                </td>
                <td>
                    <input type="radio" name="attendance_${student.student_id}" value="1"
                        ${status === 1 ? "checked" : ""} onchange="markAttendance(${student.student_id}, 1)">
                    Present
                </td>
                <td>
                    <input type="radio" name="attendance_${student.student_id}" value="2"
                        ${status === 2 ? "checked" : ""} onchange="markAttendance(${student.student_id}, 2)">
                    Participated
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (err) {
        console.error("Error loading attendance table:", err);
        tbody.innerHTML = `<tr><td colspan="5">Error loading data: ${err.message}</td></tr>`;
    }
}

// Save attendance change
async function markAttendance(studentId, status) {
    if (!currentSessionId) {
        alert("Session ID not loaded. Please refresh the page.");
        return;
    }

    try {
        const payload = {
            student_id: studentId,
            session_id: currentSessionId,
            status: status
        };

        console.log("Sending payload:", payload);

        const res = await fetch(`/attendance_app/api/attendance_set.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        console.log("API Response:", data);

        if (data.status !== "ok") {
            console.error("Failed to save attendance:", data.message);
            alert("Error saving attendance: " + data.message);
        } else {
            console.log(`Marked student ${studentId} with status ${status}`);
        }
    } catch (err) {
        console.error("Error saving attendance:", err);
        alert("Error saving attendance: " + err.message);
    }
}

// Load on page load
document.addEventListener("DOMContentLoaded", loadAndRender);
