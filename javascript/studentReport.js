

// 1) READ URL PARAMETERS

const url = new URLSearchParams(window.location.search);
const studentId = url.get("studentId");
const groupId = url.get("group");
const moduleName = url.get("module");
document.getElementById("moduleName").innerText = moduleName;
document.getElementById("groupName").innerText = groupId;

// 2) LOAD STUDENT INFO FROM SERVER

async function loadStudentInfo() {
    const res = await fetch(`/attendance_app/api/student_get.php?id=${studentId}`);
    const data = await res.json();

    document.getElementById("studentId").innerText = data.student_id;
    document.getElementById("studentName").innerText =
        `${data.first_name} ${data.last_name}`;
}

// 3) LOAD ALL SESSIONS FOR THIS GROUP
async function loadSessions() {
    const res = await fetch(`/attendance_app/api/sessions.php?group_id=${groupId}`);
    return await res.json(); 
}

// 4) LOAD ATTENDANCE FOR THIS GROUP
async function loadAttendance() {
    const res = await fetch(`/attendance_app/api/attendance_get.php?group_id=${groupId}`);
    return await res.json(); 
}

// 5) MAIN REPORT FUNCTION

async function generateReport() {

    await loadStudentInfo();

    const sessions = await loadSessions();
    const allAttendance = await loadAttendance();

    let present = 0;
    let absent = 0;
    let participated = 0; 
    
    for (let session of sessions) {
        // Find attendance record for this student in this session
        const attRecord = allAttendance.find(a => 
            a.student_id == studentId && a.session_number === session.session_number
        );

        if (!attRecord) {
            absent++;
            continue;
        }

        // Check status: 0=absent, 1=present, 2=participated
        if (attRecord.status === 1 || attRecord.status === "1") {
            present++;
        } else if (attRecord.status === 2 || attRecord.status === "2") {
            participated++;
            present++; // Participated also counts as present
        } else if (attRecord.status === 0 || attRecord.status === "0") {
            absent++;
        }
    }

    // Fill HTML
    document.getElementById("presentCount").innerText = present;
    document.getElementById("absentCount").innerText = absent;
    document.getElementById("participatedCount").innerText = participated;

    // Generate evaluation message
    
    let message = "";

    if (absent >= 5) {
        message = "! Excluded / too many absences / You need to participate more";
    }
    else if (absent >= 3) {
        if (participated <= 1) {
            message = "!! Warning / attendance low /You need to participate more";
        } else {
            message = "!! Warning /attendance low / Participation acceptable";
        }
    }
    else {
        if (participated >= 3) {
            message = " Good attendance / Excellent participation";
        } else if (participated === 0) {
            message = " Good attendance /but you need to participate more";
        } else {
            message = " Good attendance / Good participation";
        }
    }

    document.getElementById("messageBox").innerText = message;
}

generateReport();