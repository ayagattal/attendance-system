// ============================================================
//  DATA.JS — CENTRAL DATA LOADER (PHP + MySQL BACKEND)
// ============================================================

// --- Generic GET utility -------------------------------------
async function apiGet(url) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (err) {
        console.error("❌ API GET ERROR:", url, err);
        return [];
    }
}

// --- Generic POST utility ------------------------------------
async function apiPost(url, data) {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (err) {
        console.error("❌ API POST ERROR:", url, err);
        return null;
    }
}

// ============================================================
// GLOBAL DATABASE OBJECT
// ============================================================
const DB = {
    teachers: [],            // teacher list
    teacherGroups: {},       // teacher_id → [group_id,...]
    groups: [],              // all groups
    modules: [],             // all modules
    students: {},            // group_id → [students]
    sessions: {},            // group_id → [sessions]
    attendance: {}           // group_id → [attendance rows]
};

// ============================================================
// 1️⃣ LOAD TEACHERS
// ============================================================
async function loadTeachers() {
    DB.teachers = await apiGet("/attendance_app/api/loginTeacher.php?all=1");
}

// ============================================================
// 2️⃣ LOAD TEACHER GROUPS
// (used for Teacher Home Page)
// ============================================================
async function loadTeacherGroups() {
    // If a teacher is logged in, request only their groups and store as
    // DB.teacherGroups[teacherId] = [groupId,...]. Otherwise leave empty.
    const active = JSON.parse(localStorage.getItem('activeTeacher'));
    DB.teacherGroups = {};

    if (active && active.id) {
        const res = await apiGet(`/attendance_app/api/teacher_groups.php?teacher_id=${encodeURIComponent(active.id)}`);
        // res is expected to be an array of rows {group_id, group_name, module_id, module_name}
        const groups = Array.isArray(res) ? res.map(r => r.group_id) : [];
        // unique
        DB.teacherGroups[active.id] = Array.from(new Set(groups));
    }
}

// ============================================================
// 3️⃣ LOAD GROUPS LIST
// ============================================================
async function loadGroups() {
    DB.groups = await apiGet("/attendance_app/api/groups.php");
}

// ============================================================
// 4️⃣ LOAD MODULES
// ============================================================
async function loadModules() {
    DB.modules = await apiGet("/attendance_app/api/modules.php");
}

// ============================================================
// 5️⃣ LOAD STUDENTS PER GROUP
// ============================================================
async function loadStudents() {
    const list = await apiGet("/attendance_app/api/students.php");
    DB.students = {};

    list.forEach(st => {
        if (!DB.students[st.group_id]) DB.students[st.group_id] = [];
        DB.students[st.group_id].push(st);
    });
}

// ============================================================
// 6️⃣ LOAD SESSIONS FOR A GROUP
// ============================================================
async function loadSessions(groupId) {
    if (!groupId) return;
    DB.sessions[groupId] = await apiGet("/attendance_app/api/sessions.php?group_id=" + groupId);
}

// ============================================================
// 7️⃣ LOAD ATTENDANCE FOR A GROUP
// ============================================================
async function loadAttendance(groupId) {
    if (!groupId) return;
    DB.attendance[groupId] = await apiGet("/attendance_app/api/attendance_get.php?group_id=" + groupId);
}

// ============================================================
//  🔥 LOAD EVERYTHING EXCEPT GROUP-ONLY DATA
// ============================================================
async function loadAllData() {
    await loadTeachers();
    await loadTeacherGroups();
    await loadGroups();
    await loadModules();
    await loadStudents();

    console.log("✔ DB LOADED SUCCESSFULLY:", DB);
}
