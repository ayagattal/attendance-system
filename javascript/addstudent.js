// Add new students to groups in(teacher page):

document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("addStudentForm");
    const classSelect = document.getElementById("studentClass");
    
    if (!form) return; 

    console.log(" addstudent.js loaded");

    // Load groups and populate dropdown
    try {
        console.log(" Loading groups...");
        const res = await fetch('/attendance_app/api/groups.php');
        const groups = await res.json();
        
        console.log(" Groups loaded:", groups);

        if (!Array.isArray(groups) || groups.length === 0) {
            console.warn("  No groups available");
            classSelect.innerHTML = '<option disabled>No groups available</option>';
            return;
        }

        // Populate group dropdown
        groups.forEach(group => {
            const option = document.createElement('option');
            option.value = group.group_id;
            option.textContent = group.group_name;
            classSelect.appendChild(option);
        });

        console.log("Dropdown populated with", groups.length, "groups");

    } catch (err) {
        console.error(" Error loading groups:", err);
        classSelect.innerHTML = '<option disabled>Error loading groups</option>';
    }

    // Handle form submission
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const studentId = document.getElementById("studentId").value.trim();
        const studentLast = document.getElementById("studentLast").value.trim();
        const studentFirst = document.getElementById("studentFirst").value.trim();
        const groupId = classSelect.value;

        console.log(" Form submitted:", { studentId, studentLast, studentFirst, groupId });

        if (!studentId || !studentLast || !studentFirst || !groupId) {
            alert(" Please fill all fields");
            return;
        }

        try {
            // Call API to add student
            const payload = {
                student_id: studentId,
                first_name: studentFirst,
                last_name: studentLast,
                group_id: parseInt(groupId)
            };

            console.log(" Sending to API:", payload);

            const res = await fetch('/attendance_app/api/students.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            console.log(" API response:", result);

            if (result.success || result.status === 'ok') {
                alert(` Student "${studentFirst} ${studentLast}" added successfully!`);
                form.reset();
            } else {
                alert(` Error: ${result.message || 'Failed to add student'}`);
            }
        } catch (err) {
            console.error(" Error adding student:", err);
            alert(` Error: ${err.message}`);
        }
    });
});
