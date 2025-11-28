// ===============================================================
// studentHome.js — Dashboard for logged student
// ===============================================================

// 1) Read logged student from localStorage (after login)
const loggedStudent = JSON.parse(localStorage.getItem("loggedStudent"));
if (!loggedStudent) {
    window.location.href = "/attendance_app/pages/login.html";
}

// Welcome text (fix names)
document.getElementById("welcomeText").innerText =
    `Welcome, ${loggedStudent.first} ${loggedStudent.last}`;

// Container
const moduleListDiv = document.getElementById("moduleList");

// ===============================================================
// 2) Load groups for this student (FIXED API NAME + FIXED PARAM)
//     GET: api/student_group.php?student_id=XXXX
// ===============================================================

async function loadStudentGroups() {
    const res = await fetch(`/attendance_app/api/student_group.php?student_id=${loggedStudent.id}`);
    const data = await res.json();

    return data;  
    // MUST RETURN:
    // [{ group_id, group_name, module_name }]
}

// ===============================================================
// 3) Display modules as buttons
// ===============================================================

async function initStudentDashboard() {
    const groupList = await loadStudentGroups();

    if (!groupList.length) {
        moduleListDiv.innerHTML = `<p>You are not enrolled in any groups.</p>`;
        return;
    }

    groupList.forEach(g => {
        const btn = document.createElement("button");
        btn.className = "module-btn";
        btn.textContent = `${g.module_name} — ${g.group_name}`;

        btn.onclick = () => {
            window.location.href =
                `/attendance_app/pages/studentReport.html?studentId=${loggedStudent.id}&group=${g.group_id}&module=${encodeURIComponent(g.module_name)}`;
        };

        moduleListDiv.appendChild(btn);
    });
}

// Start
initStudentDashboard();














