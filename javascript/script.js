// -------------------- WELCOME PAGE REDIRECT --------------------
if (window.location.pathname.includes("index.html")) {
    $(window).on("load", function () {
        setTimeout(() => {
            $("body").addClass("fade-out");

            setTimeout(() => {
                window.location.href = "/attendance_app/pages/login.html";

            }, 800);

        }, 1500);
    });
}
// ============================================================


document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("login-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const role = document.getElementById("role").value;
        const id = document.getElementById("id").value.trim();
        const last = document.getElementById("Lastname").value.trim().toLowerCase();
        const first = document.getElementById("Firstname").value.trim().toLowerCase();

        if (!role || !id || !first || !last) {
            alert("Please fill all fields.");
            return;
        }

        // -----------------------------
        // 1 STUDENT LOGIN
        // -----------------------------
        if (role === "student") {
            const res = await fetch("/attendance_app/api/loginStudent.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, first, last })
            });

            const data = await res.json();

            if (data.status !== "ok") {
                alert("! " + data.message);
                return;
            }

            // store student info 
            const studentObj = {
                role: "student",
                id: data.student.id,
                first: data.student.first,
                last: data.student.last,
                name: data.student.first + " " + data.student.last,
                group: data.student.group_id
            };
            localStorage.setItem("loggedStudent", JSON.stringify(studentObj));
            localStorage.setItem("loggedUser", JSON.stringify(studentObj));

            window.location.href = "/attendance_app/pages/studentHome.html";
            return;
        }

        // -----------------------------
        // TEACHER LOGIN
        // -----------------------------
        if (role === "teacher") {
            try {
                console.log(" Teacher login attempt:", { id, first, last });
                
                const res = await fetch("/attendance_app/api/loginTeacher.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id, first, last })
                });

                console.log(" API response status:", res.status);
                
                const data = await res.json();
                console.log(" API response:", data);

                if (data.status !== "ok") {
                    alert("❌!!!! " + (data.message || "Login failed"));
                    console.error("❌ Login failed:", data);
                    return;
                }

                console.log("✅ Teacher login successful:", data.teacher);
                
                // For simplicity, redirect teacher to home page with teacher_id
                // (home page will handle teacher info and overview)
                const redirectUrl = `/attendance_app/pages/home.html?teacher_id=${data.teacher.id}`;
                console.log(" Redirecting to:", redirectUrl);
                window.location.href = redirectUrl;
                return;
            } catch (err) {
                console.error("❌ Teacher login error:", err);
                alert("❌ Login error: " + err.message);
                return;
            }
        }

        // -----------------------------
        //  ADMIN LOGIN (Optional)
        // -----------------------------
        if (role === "admin") {
            if (id === "admin" && first === "admin" && last === "admin") {
                localStorage.setItem("loggedUser", JSON.stringify({
                    role: "admin",
                    id: "admin",
                    name: "Administrator"
                }));

                window.location.href = "/attendance_app/pages/home.html";
            } else {
                alert("❌ Invalid admin login!");
            }
            return;
        }
    });
});








/**********************************************************
 *  teacherHome.js — Home dashboard logic - OVERVIEW ONLY
 **********************************************************/

document.addEventListener("DOMContentLoaded", async () => {

    // Check if we're on the home page (look for teacher-name element)
    const teacherNameEl = document.getElementById('teacher-name');
    if (!teacherNameEl) {
        // Not on home page, exit early
        return;
    }

    // Get teacher_id from URL params (set by login redirect)
    const urlParams = new URLSearchParams(window.location.search);
    let teacherId = urlParams.get("teacher_id");

    // Fallback: check localStorage
    if (!teacherId) {
        const activeTeacher = JSON.parse(localStorage.getItem("activeTeacher"));
        if (!activeTeacher) {
            window.location.href = "/attendance_app/pages/login.html";
            return;
        }
        teacherId = activeTeacher.id;
    }

    // Hide auth check overlay
    const authCheck = document.getElementById("authCheck");
    if (authCheck) {
        authCheck.style.display = "none";
    }

    try {
        // Get teacher info
        const teacherRes = await fetch(`/attendance_app/api/loginTeacher.php?all=1`);
        const allTeachers = await teacherRes.json();
        const teacher = allTeachers.find(t => String(t.teacher_id) === String(teacherId) || String(t.id) === String(teacherId));

        if (!teacher) {
            window.location.href = "/attendance_app/pages/login.html";
            return;
        }

        // Display teacher name
        const cap = s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
        const firstName = teacher.first_name || teacher.first || '';
        const lastName = teacher.last_name || teacher.last || '';
        const fullName = `${cap(firstName)} ${cap(lastName)}`;
        
        document.getElementById("teacher-name").innerText = fullName;
        document.getElementById("welcomeMrText").innerText = `Welcome Mr. ${cap(firstName)}!`;

        // Get teacher's groups
        const groupsRes = await fetch(`/attendance_app/api/teacher_groups.php?teacher_id=${teacherId}`);
        const teacherGroupsRaw = await groupsRes.json();

        if (!Array.isArray(teacherGroupsRaw) || teacherGroupsRaw.length === 0) {
            document.getElementById("total-groups").innerText = "0";
            document.getElementById("total-modules").innerText = "0";
            document.getElementById("total-students").innerText = "0";
            document.getElementById("avg-attendance").innerText = "0%";
            return;
        }

        // Count groups and modules
        const groupMap = {};
        const moduleSet = new Set();

        teacherGroupsRaw.forEach(row => {
            if (!groupMap[row.group_id]) {
                groupMap[row.group_id] = row.group_name;
            }
            if (row.modules && Array.isArray(row.modules)) {
                row.modules.forEach(mod => {
                    moduleSet.add(mod.module_name);
                });
            }
        });

        const groups = Object.keys(groupMap);
        document.getElementById("total-groups").innerText = groups.length;
        document.getElementById("total-modules").innerText = moduleSet.size;

        // Count total students across all groups
        let totalStudents = 0;
        for (const groupId of groups) {
            try {
                const studentRes = await fetch(`/attendance_app/api/students.php?group_id=${groupId}`);
                const students = await studentRes.json();
                if (Array.isArray(students)) {
                    totalStudents += students.length;
                }
            } catch (e) {
                // Silently continue
            }
        }
        document.getElementById("total-students").innerText = totalStudents;

        // Calculate average attendance
        let totalPresent = 0;
        let totalPossible = 0;

        for (const groupId of groups) {
            try {
                const studentRes = await fetch(`/attendance_app/api/students.php?group_id=${groupId}`);
                const students = await studentRes.json();

                const sessionRes = await fetch(`/attendance_app/api/sessions.php?group_id=${groupId}`);
                const sessions = await sessionRes.json();

                const attendanceRes = await fetch(`/attendance_app/api/attendance_get.php?group_id=${groupId}`);
                const attendance = await attendanceRes.json();

                if (Array.isArray(students) && Array.isArray(sessions) && Array.isArray(attendance)) {
                    students.forEach(student => {
                        sessions.forEach(session => {
                            totalPossible++;
                            const att = attendance.find(a => 
                                a.student_id === student.student_id && 
                                a.session_id === session.session_id
                            );
                            // Status codes: 0=absent, 1=present, 2=participated, 3=present+participated
                            if (att && parseInt(att.status) > 0) {
                                totalPresent++;
                            }
                        });
                    });
                }
            } catch (e) {
                console.warn("Average attendance error:", e);
            }
        }

        const avg = totalPossible > 0
            ? ((totalPresent / totalPossible) * 100).toFixed(1)
            : "0";

        document.getElementById("avg-attendance").innerText = avg + "%";

    } catch (err) {
        // Show default values on error
        const authCheck = document.getElementById("authCheck");
        if (authCheck) authCheck.style.display = "none";
        document.getElementById("total-groups").innerText = "0";
        document.getElementById("total-modules").innerText = "0";
        document.getElementById("total-students").innerText = "0";
        document.getElementById("avg-attendance").innerText = "0%";
    }
});

// ============================================================
// addnewstudent.js — ADD NEW STUDENT PAGE
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {

    /* ---------------------------------------------
       1) LOAD DATABASE
    --------------------------------------------- */
    await loadAllData(); // loads DB.modules, DB.groups, DB.students, DB.attendance


    /* ---------------------------------------------
       2) POPULATE GROUP DROPDOWN
    --------------------------------------------- */
    const select = document.getElementById("studentClass");
    if (!select) return; // not on this page

    DB.modules.forEach(module => {
        DB.groups[module.module_id].forEach(group => {
            const opt = document.createElement("option");
            opt.value = group.group_id;
            opt.textContent = `${module.module_name} — ${group.group_name}`;
            select.appendChild(opt);
        });
    });


    /* ---------------------------------------------
       3) ADD STUDENT
    --------------------------------------------- */
    const form = document.getElementById("addStudentForm");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const id    = document.getElementById("studentId").value.trim();
        const last  = document.getElementById("studentLast").value.trim();
        const first = document.getElementById("studentFirst").value.trim();
        const groupId = document.getElementById("studentClass").value;

        if (!groupId) {
            alert("Please select a class.");
            return;
        }

        // Create array if not existing
        if (!DB.students[groupId]) DB.students[groupId] = [];

        // Create student row
        const newStudent = {
            student_id: id,
            first_name: first,
            last_name: last,
            group_id: groupId
        };

        // Add student
        DB.students[groupId].push(newStudent);


        /* ---------------------------------------------
           4) INITIALIZE ATTENDANCE FOR ALL PAST SESSIONS
        --------------------------------------------- */
        if (!DB.attendance[groupId]) DB.attendance[groupId] = [];

        const sessions = DB.sessions[groupId] || [];

        sessions.forEach(session => {
            DB.attendance[groupId].push({
                session_id: session.session_id,
                student_id: id,
                status: 0 // 0 = absent (default)
            });
        });


        /* ---------------------------------------------
           5) SAVE DATABASE
        --------------------------------------------- */
        await saveAllData();


        alert(`✔ Student "${first} ${last}" added successfully!`);
        form.reset();
    });
});




