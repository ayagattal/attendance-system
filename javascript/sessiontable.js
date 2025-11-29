// ============================================================
// for Attendance taking
// ============================================================

console.log(" sessiontable.js loaded");
console.log(" Full URL:", window.location.href);
console.log("Search params:", window.location.search);

// Read URL parameters
const urlParams = new URLSearchParams(window.location.search);
const groupId = urlParams.get("group_id");
const sessionNumber = urlParams.get("session");

console.log(" Raw URLSearchParams:");
console.log("  - group_id:", urlParams.get("group_id"), "type:", typeof urlParams.get("group_id"));
console.log("  - session:", urlParams.get("session"), "type:", typeof urlParams.get("session"));

console.log(" Final parsed values:", { groupId, sessionNumber, groupIdType: typeof groupId, sessionNumberType: typeof sessionNumber });
console.log(" groupId is empty?", !groupId);
console.log(" sessionNumber is empty?", !sessionNumber);

if (!groupId || !sessionNumber) {
    console.error("! Missing required parameters");
    window.addEventListener("DOMContentLoaded", () => {
        const tbody = document.getElementById("sessionTableBody");
        if (tbody) tbody.innerHTML = `<tr><td colspan="6">! Missing group_id or session parameter</td></tr>`;
    });
}

// Store session_id for later use
let currentSessionId = null;
const tbody = document.getElementById("sessionTableBody");

// ============================================================
// Main function to load and render table
// ============================================================

async function loadAndRender() {
    console.log("! loadAndRender() started");
    console.log("tbody element exists?", !!tbody);
    
    try {
        // Step 1: Get sessions for this group
        console.log(`Fetching sessions for group ${groupId}...`);
        const sessionsRes = await fetch(`/attendance_app/api/sessions.php?group_id=${groupId}`);
        if (!sessionsRes.ok) throw new Error(`Sessions API failed: ${sessionsRes.status}`);
        const sessions = await sessionsRes.json();
        console.log(`Loaded ${sessions.length} sessions:`, sessions);
        
        // Find the session matching our session_number
        const sessionObj = sessions.find(s => parseInt(s.session_number) === parseInt(sessionNumber));
        if (!sessionObj) {
            throw new Error(`Session ${sessionNumber} not found in group ${groupId}`);
        }
        currentSessionId = sessionObj.session_id;
        console.log(`Found session: session_id=${currentSessionId}`);
        
        // Update title
        const titleEl = document.getElementById("sessionTitle");
        if (titleEl) titleEl.textContent = `Session ${sessionNumber}`;
        
        // Step 2: Get students for this group
        console.log(` Fetching students for group ${groupId}...`);
        const studentsRes = await fetch(`/attendance_app/api/students.php?group_id=${groupId}`);
        if (!studentsRes.ok) throw new Error(`Students API failed: ${studentsRes.status}`);
        const students = await studentsRes.json();
        console.log(`Loaded ${students.length} students`);
        
        if (students.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6">No students in this group</td></tr>`;
            return;
        }
        
        // Step 3: Get attendance for this group
        console.log(`📡 Fetching attendance for group ${groupId}...`);
        const attendanceRes = await fetch(`/attendance_app/api/attendance_get.php?group_id=${groupId}`);
        if (!attendanceRes.ok) throw new Error(`Attendance API failed: ${attendanceRes.status}`);
        const allAttendance = await attendanceRes.json();
        console.log(` Loaded ${allAttendance.length} attendance records`);
        
        // Filter to just this session
        const sessionAttendance = allAttendance.filter(a => parseInt(a.session_number) === parseInt(sessionNumber));
        console.log(` Filtered to ${sessionAttendance.length} records for this session`);
        
        // Build attendance map
        const attendanceMap = {};
        sessionAttendance.forEach(a => {
            attendanceMap[String(a.student_id)] = parseInt(a.status) || 0;
        });
        console.log(" Attendance map:", attendanceMap);
        
        // Step 4: Render table rows
        console.log(` Rendering ${students.length} rows...`);
        tbody.innerHTML = "";
        
        students.forEach(student => {
            const status = attendanceMap[String(student.student_id)] || 0;
            const row = document.createElement("tr");
            
            // Check which flags are set: 0=absent, 1=present, 2=participated, 3=present+participated
            const isAbsent = status === 0;
            const isPresent = status === 1 || status === 3;
            const isParticipated = status === 2 || status === 3;
            
            // Build the status cells with checkboxes - allows multiple selections
            const statusCells = `
                <td style="text-align:center;"><input type="checkbox" class="absent_${student.student_id}" ${isAbsent ? "checked" : ""} onchange="markAttendanceCheckbox('${student.student_id}')" title="Mark as Absent"></td>
                <td style="text-align:center;"><input type="checkbox" class="present_${student.student_id}" ${isPresent ? "checked" : ""} onchange="markAttendanceCheckbox('${student.student_id}')" title="Mark as Present"></td>
                <td style="text-align:center;"><input type="checkbox" class="participated_${student.student_id}" ${isParticipated ? "checked" : ""} onchange="markAttendanceCheckbox('${student.student_id}')" title="Mark as Participated"></td>
            `;
            
            row.innerHTML = `
                <td>${student.student_id}</td>
                <td>${student.last_name}</td>
                <td>${student.first_name}</td>
                ${statusCells}
            `;
            
            tbody.appendChild(row);
        });
        
        console.log("Table rendered successfully!");
        
    } catch (err) {
        console.error("!! Error:", err.message);
        console.error("Stack:", err.stack);
        tbody.innerHTML = `<tr><td colspan="6">!! ${err.message}</td></tr>`;
    }
}

// ============================================================
// Mark attendance function (for checkboxes - multiple selections allowed)
// ============================================================

async function markAttendanceCheckbox(studentId) {
    console.log(` Checkbox changed for student: ${studentId}`);
    
    if (!currentSessionId) {
        alert("Session not loaded. Please refresh.");
        return;
    }

    try {
        // Get checkbox states
        const absentCheckbox = document.querySelector(`.absent_${studentId}`);
        const presentCheckbox = document.querySelector(`.present_${studentId}`);
        const participatedCheckbox = document.querySelector(`.participated_${studentId}`);
        
        const isAbsent = absentCheckbox?.checked || false;
        const isPresent = presentCheckbox?.checked || false;
        const isParticipated = participatedCheckbox?.checked || false;
        
        console.log(`  Checkbox states: absent=${isAbsent}, present=${isPresent}, participated=${isParticipated}`);
        
        // Determine status code:
        // 0 = absent (only absent checked or nothing checked)
        // 1 = present (only present checked)
        // 2 = participated (only participated checked)
        // 3 = present + participated (both checked)
        let status = 0;
        
        if (isAbsent) {
            // If absent is checked, uncheck the others
            if (presentCheckbox) presentCheckbox.checked = false;
            if (participatedCheckbox) participatedCheckbox.checked = false;
            status = 0;
            console.log("  Set to: Absent only");
        } else if (isPresent && isParticipated) {
            // Both present and participated
            status = 3;
            console.log("  Set to: Present + Participated");
        } else if (isPresent) {
            // Only present
            status = 1;
            console.log("  Set to: Present only");
        } else if (isParticipated) {
            // Only participated
            status = 2;
            console.log("  Set to: Participated only");
        } else {
            // Nothing checked = absent
            status = 0;
            console.log("  Set to: Absent (nothing checked)");
        }
        
        console.log(`  Final status: ${status}`);
        
        const payload = {
            student_id: String(studentId),
            session_id: parseInt(currentSessionId),
            status: parseInt(status)
        };
        
        console.log(" Sending payload:", payload);
        
        // Validate payload
        if (!payload.student_id || !payload.session_id || payload.status === undefined || payload.status === null) {
            console.error(" Invalid payload:", payload);
            alert("Error: Invalid data to send");
            return;
        }
        
        const res = await fetch("/attendance_app/api/attendance_set.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        console.log("📥 Response:", data);
        
        if (data.status !== "ok") {
            console.error(" API Error:", data.message);
            alert("Error: " + data.message);
        } else {
            console.log(` Successfully saved attendance for student ${studentId}`);
        }
    } catch (err) {
        console.error("!! Save failed:", err.message);
        console.error("Stack:", err.stack);
        alert("Error saving: " + err.message);
    }
}

// Keep old function for backwards compatibility (if needed)
async function markAttendance(studentId, status) {
    console.log(` markAttendance called (old function): student=${studentId}, status=${status}`);
    // This can be used for direct status setting if needed
}

// Start when DOM is ready


if (document.readyState === "loading") {
    console.log(" Waiting for DOM...");
    document.addEventListener("DOMContentLoaded", loadAndRender);
} else {
    console.log(" DOM already ready, starting immediately");
    loadAndRender();
}
