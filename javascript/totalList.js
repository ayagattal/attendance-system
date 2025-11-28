// ============================================================
// totalList.js — TOTAL attendance for one group
// ============================================================

// Read URL parameters
const urlParams = new URLSearchParams(window.location.search);
const moduleId = urlParams.get("module_id");
const groupId = urlParams.get("group_id");

// Table body
const tbody = document.getElementById("totalTableBody");

// ============================================================
// LOAD AND RENDER TABLE
// ============================================================

async function initTotalList() {
    if (!groupId) {
        tbody.innerHTML = `<tr><td colspan="5">Missing group_id parameter</td></tr>`;
        return;
    }

    try {
        // Load students for this group
        const studentsRes = await fetch(`/attendance_app/api/students.php?group_id=${encodeURIComponent(groupId)}`);
        const students = await studentsRes.json();

        // Load sessions for this group
        const sessionsRes = await fetch(`/attendance_app/api/sessions.php?group_id=${encodeURIComponent(groupId)}`);
        const sessions = await sessionsRes.json();

        // Load attendance for this group
        const attendanceRes = await fetch(`/attendance_app/api/attendance_get.php?group_id=${encodeURIComponent(groupId)}`);
        const attendance = await attendanceRes.json();

        if (!Array.isArray(students) || !Array.isArray(sessions) || !Array.isArray(attendance)) {
            tbody.innerHTML = `<tr><td colspan="5">Error loading data</td></tr>`;
            return;
        }

        const totalSessions = sessions.length;

        // Build attendance map: student_id → { presentCount, participatedCount }
        const map = {};

        students.forEach(st => {
            map[st.student_id] = { present: 0, participated: 0 };
        });

        attendance.forEach(row => {
            if (!map[row.student_id]) return;

            if (row.status == 1) map[row.student_id].present++;
            if (row.status == 2) {
                map[row.student_id].present++;
                map[row.student_id].participated++;
            }
        });

        // Build table rows
        tbody.innerHTML = "";
        students.forEach(st => {
            const present = map[st.student_id].present;
            const participated = map[st.student_id].participated;
            const absences = totalSessions - present;

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${st.student_id}</td>
                <td>${st.last_name}</td>
                <td>${st.first_name}</td>
                <td>${present}</td>
                <td>${participated}</td>
            `;

            // Color logic
            if (absences < 3) row.style.backgroundColor = "#c8f7c5";      // green
            else if (absences <= 4) row.style.backgroundColor = "#fff3b0"; // yellow
            else row.style.backgroundColor = "#ffb3b3";                    // red

            tbody.appendChild(row);
        });

        setupButtons(totalSessions);

    } catch (err) {
        console.error("Error loading totalList:", err);
        tbody.innerHTML = `<tr><td colspan="5">Error loading data: ${err.message}</td></tr>`;
    }
}

// ============================================================
// SETUP BUTTONS
// ============================================================

function setupButtons(totalSessions) {

    document.getElementById("showReportBtn").addEventListener("click", () => {

        let presentCount = 0;
        let participatedCount = 0;

        $("#totalTableBody tr").each(function () {
            const present = parseInt($(this).find("td:nth-child(4)").text());
            const participated = parseInt($(this).find("td:nth-child(5)").text());

            if (present > 0) presentCount++;
            if (participated > 0) participatedCount++;
        });

        const totalStudents = $("#totalTableBody tr").length;
        const absentCount = totalStudents - presentCount;

        // Fill report text
        $("#totalStudents").text(totalStudents);
        $("#totalPresent").text(presentCount);
        $("#totalAbsent").text(absentCount);
        $("#totalParticipated").text(participatedCount);

        $("#reportSection").show();

        // Pie chart
        const ctx = document.getElementById("attendanceChart").getContext("2d");
        new Chart(ctx, {
            type: "pie",
            data: {
                labels: ["Present", "Absent", "Participated"],
                datasets: [{
                    data: [presentCount, absentCount, participatedCount]
                }]
            }
        });
    });

    // HIGHLIGHT LOW ABSENCE STUDENTS (<3)
    $("#highlightBtn").click(function () {
        $("#totalTableBody tr").each(function () {
            const present = parseInt($(this).find("td:nth-child(4)").text());
            const absences = totalSessions - present;

            if (absences < 3) {
                $(this).animate({ opacity: 0.3 }, 200)
                        .animate({ opacity: 1 }, 200)
                        .css("background-color", "#90ee90");
            }
        });
    });

    // RESET COLORS
    $("#resetBtn").click(function () {
        $("#totalTableBody tr").each(function () {
            const present = parseInt($(this).find("td:nth-child(4)").text());
            const absences = totalSessions - present;

            if (absences < 3) $(this).css("background-color", "#c8f7c5");
            else if (absences <= 4) $(this).css("background-color", "#fff3b0");
            else $(this).css("background-color", "#ffb3b3");
        });
    });

    // SEARCH
    $("#searchInput").on("keyup", function () {
        const value = $(this).val().toLowerCase();

        $("#totalTableBody tr").filter(function () {
            const last = $(this).find("td:nth-child(2)").text().toLowerCase();
            const first = $(this).find("td:nth-child(3)").text().toLowerCase();

            $(this).toggle(last.includes(value) || first.includes(value));
        });
    });

    // SORT BY ABSENCES
    $("#sortAbsencesBtn").click(function () {

        const rows = $("#totalTableBody tr").get();

        rows.sort(function (a, b) {
            const presentA = parseInt($(a).find("td:nth-child(4)").text());
            const presentB = parseInt($(b).find("td:nth-child(4)").text());

            const absA = totalSessions - presentA;
            const absB = totalSessions - presentB;

            return absA - absB;
        });

        $.each(rows, (i, row) => $("#totalTableBody").append(row));
    });

    // SORT BY PARTICIPATION
    $("#sortParticipationBtn").click(function () {
        const rows = $("#totalTableBody tr").get();

        rows.sort(function (a, b) {
            const partA = parseInt($(a).find("td:nth-child(5)").text());
            const partB = parseInt($(b).find("td:nth-child(5)").text());

            return partB - partA;
        });

        $.each(rows, (i, row) => $("#totalTableBody").append(row));
    });
}

// Start when page loads
document.addEventListener("DOMContentLoaded", initTotalList);

    document.getElementById("showReportBtn").addEventListener("click", () => {

        let presentCount = 0;
        let participatedCount = 0;

        $("#totalTableBody tr").each(function () {
            const present = parseInt($(this).find("td:nth-child(4)").text());
            const participated = parseInt($(this).find("td:nth-child(5)").text());

            if (present > 0) presentCount++;
            if (participated > 0) participatedCount++;
        });

        const totalStudents = $("#totalTableBody tr").length;
        const absentCount = totalStudents - presentCount;

        // Fill report text
        $("#totalStudents").text(totalStudents);
        $("#totalPresent").text(presentCount);
        $("#totalAbsent").text(absentCount);
        $("#totalParticipated").text(participatedCount);

        $("#reportSection").show();

        // Pie chart
        const ctx = document.getElementById("attendanceChart").getContext("2d");
        new Chart(ctx, {
            type: "pie",
            data: {
                labels: ["Present", "Absent", "Participated"],
                datasets: [{
                    data: [presentCount, absentCount, participatedCount]
                }]
            }
        });
    });

    // =====================================================
    // HIGHLIGHT LOW ABSENCE STUDENTS (<3)
    // =====================================================
    $("#highlightBtn").click(function () {
        $("#totalTableBody tr").each(function () {
            const present = parseInt($(this).find("td:nth-child(4)").text());
            const absences = totalSessions - present;

            if (absences < 3) {
                $(this).animate({ opacity: 0.3 }, 200)
                        .animate({ opacity: 1 }, 200)
                        .css("background-color", "#90ee90");
            }
        });
    });

    // RESET COLORS
    $("#resetBtn").click(function () {
        $("#totalTableBody tr").each(function () {
            const present = parseInt($(this).find("td:nth-child(4)").text());
            const absences = totalSessions - present;

            if (absences < 3) $(this).css("background-color", "#c8f7c5");
            else if (absences <= 4) $(this).css("background-color", "#fff3b0");
            else $(this).css("background-color", "#ffb3b3");
        });
    });

    // SEARCH
    $("#searchInput").on("keyup", function () {
        const value = $(this).val().toLowerCase();

        $("#totalTableBody tr").filter(function () {
            const last = $(this).find("td:nth-child(2)").text().toLowerCase();
            const first = $(this).find("td:nth-child(3)").text().toLowerCase();

            $(this).toggle(last.includes(value) || first.includes(value));
        });
    });

    // SORT BY ABSENCES
    $("#sortAbsencesBtn").click(function () {

        const rows = $("#totalTableBody tr").get();

        rows.sort(function (a, b) {
            const presentA = parseInt($(a).find("td:nth-child(4)").text());
            const presentB = parseInt($(b).find("td:nth-child(4)").text());

            const absA = totalSessions - presentA;
            const absB = totalSessions - presentB;

            return absA - absB;
        });

        $.each(rows, (i, row) => $("#totalTableBody").append(row));
    });

    // SORT BY PARTICIPATION
    $("#sortParticipationBtn").click(function () {
        const rows = $("#totalTableBody tr").get();

        rows.sort(function (a, b) {
            const partA = parseInt($(a).find("td:nth-child(5)").text());
            const partB = parseInt($(b).find("td:nth-child(5)").text());

            return partB - partA;
        });

        $.each(rows, (i, row) => $("#totalTableBody").append(row));
    });
}

// Start when page loads
document.addEventListener("DOMContentLoaded", initTotalList);
