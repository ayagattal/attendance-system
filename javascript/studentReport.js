// -------------------------------
// 1) READ URL PARAMETERS
// -------------------------------
const url = new URLSearchParams(window.location.search);
const studentId = url.get("studentId");
const groupId = url.get("group");
const moduleName = url.get("module");

// Write module + group
document.getElementById("moduleName").innerText = moduleName;
document.getElementById("groupName").innerText = groupId;

// -------------------------------
// 2) LOAD STUDENT INFO FROM SERVER
// -------------------------------
async function loadStudentInfo() {
    const res = await fetch(`/attendance_app/api/student_get.php?id=${studentId}`);
    const data = await res.json();

    document.getElementById("studentId").innerText = data.student_id;
    document.getElementById("studentName").innerText =
        `${data.first_name} ${data.last_name}`;
}

// -------------------------------
// 3) LOAD ALL SESSIONS FOR THIS GROUP
// -------------------------------
async function loadSessions() {
    const res = await fetch(`/attendance_app/api/sessions_get.php?group_id=${groupId}`);
    return await res.json(); // [{session_id, session_number}, ...]
}

// -------------------------------
// 4) LOAD ATTENDANCE FOR ONE SESSION
// -------------------------------
async function loadAttendance(sessionId) {
    const res = await fetch(`/attendance_app/api/attendance_get.php?session_id=${sessionId}`);
    return await res.json(); // [{student_id, present, participated}]
}

// -------------------------------
// 5) MAIN REPORT FUNCTION
// -------------------------------
async function generateReport() {

    await loadStudentInfo();

    const sessions = await loadSessions();

    let present = 0;
    let absent = 0;
    let participated = 0; // <-- your DB has no field for this

    for (let s of sessions) {

        const attRows = await loadAttendance(s.session_id);

        const rec = attRows.find(r => r.student_id == studentId);

        if (!rec) {
            // If no record → absent
            absent++;
            continue;
        }

        if (rec.status === "present") present++;
        if (rec.status === "absent") absent++;

        // No participated column in DB → always 0
    }

    // Fill HTML
    document.getElementById("presentCount").innerText = present;
    document.getElementById("absentCount").innerText = absent;
    document.getElementById("participatedCount").innerText = participated;

    // -------------------------------
    // 6) Generate evaluation message
    // -------------------------------
    let message = "";

    if (absent >= 5) {
        message = "❌ Excluded – too many absences – You need to participate more";
    }
    else if (absent >= 3) {
        if (participated <= 1) {
            message = "⚠️ Warning – attendance low – You need to participate more";
        } else {
            message = "⚠️ Warning – attendance low – Participation acceptable";
        }
    }
    else {
        if (participated >= 3) {
            message = "✅ Good attendance – Excellent participation";
        } else if (participated === 0) {
            message = "ℹ️ Good attendance – but you need to participate more";
        } else {
            message = "👍 Good attendance – Good participation";
        }
    }

    document.getElementById("messageBox").innerText = message;
}

// -------------------------------
// RUN REPORT
// -------------------------------
generateReport();
