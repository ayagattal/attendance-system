
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
 
// 2) LOAD STUDENT GROUPS FROM SERVER
async function loadStudentGroups() {
    const res = await fetch(`/attendance_app/api/student_group.php?student_id=${loggedStudent.id}`);
    const data = await res.json();

    return data;  
   
}

// Display modules as buttons (deduplicated)

async function initStudentDashboard() {
    const groupList = await loadStudentGroups();

    console.log("📚 Modules from API:", groupList.length);

    if (!groupList.length) {
        moduleListDiv.innerHTML = `<p>You are not enrolled in any groups.</p>`;
        return;
    }

    // Create buttons for each module
    groupList.forEach(module => {
        const btn = document.createElement("button");
        btn.className = "module-btn";
        btn.textContent = `${module.module_name} — ${module.group_name}`;

        btn.onclick = () => {
            window.location.href =
                `/attendance_app/pages/studentReport.html?studentId=${loggedStudent.id}&group=${module.group_id}&module=${encodeURIComponent(module.module_name)}`;
        };

        moduleListDiv.appendChild(btn);
    });
    
    console.log(" StudentHome dashboard loaded with", groupList.length, "modules");
}

initStudentDashboard();














