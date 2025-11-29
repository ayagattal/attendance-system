console.log("totalList.js loaded");
const urlParams = new URLSearchParams(window.location.search);
const groupId = urlParams.get("group_id");
const moduleId = urlParams.get("module_id");
console.log("📋 Parameters:", { groupId, moduleId });

const tbody = document.getElementById("totalTableBody");
let totalSessions = 0;

async function initTotalList() {
    if (!groupId) {
        tbody.innerHTML = "<tr><td colspan='5'>Missing group_id parameter</td></tr>";
        return;
    }

    try {
        console.log("📡 Loading data for group:", groupId);
        
        const studentsRes = await fetch("/attendance_app/api/students.php?group_id=" + encodeURIComponent(groupId));
        const students = await studentsRes.json();
        console.log("Students:", students.length);

        const sessionsRes = await fetch("/attendance_app/api/sessions.php?group_id=" + encodeURIComponent(groupId));
        const sessions = await sessionsRes.json();
        console.log(" Sessions:", sessions.length);
        totalSessions = sessions.length;

        const attendanceRes = await fetch("/attendance_app/api/attendance_get.php?group_id=" + encodeURIComponent(groupId));
        const attendance = await attendanceRes.json();
        console.log(" Attendance records:", attendance.length);

        if (!Array.isArray(students) || students.length === 0) {
            tbody.innerHTML = "<tr><td colspan='5'>No students in this group</td></tr>";
            return;
        }

        if (!Array.isArray(sessions) || sessions.length === 0) {
            tbody.innerHTML = "<tr><td colspan='5'>No sessions for this group</td></tr>";
            return;
        }

        const attendanceMap = {};
        students.forEach(st => {
            attendanceMap[st.student_id] = { 
                present: 0, 
                participated: 0,
                absent: 0
            };
        });

        attendance.forEach(record => {
            if (!attendanceMap[record.student_id]) return;
            
            const status = parseInt(record.status);
            
            if (status === 0) {
                attendanceMap[record.student_id].absent++;
            } else if (status === 1) {
                attendanceMap[record.student_id].present++;
            } else if (status === 2) {
                attendanceMap[record.student_id].participated++;
            } else if (status === 3) {
                attendanceMap[record.student_id].present++;
                attendanceMap[record.student_id].participated++;
            }
        });

        console.log(" Rendering table rows...");
        tbody.innerHTML = "";
        
        students.forEach(st => {
            const stats = attendanceMap[st.student_id];
            const present = stats.present;
            const participated = stats.participated;
            const absent = totalSessions - present;

            const row = document.createElement("tr");
            row.innerHTML = "<td>" + st.student_id + "</td><td>" + st.last_name + "</td><td>" + st.first_name + "</td><td data-present='" + present + "'>" + present + "</td><td data-participated='" + participated + "'>" + participated + "</td>";

            if (absent < 3) {
                row.style.backgroundColor = "#c8f7c5";
            } else if (absent < 4) {
                row.style.backgroundColor = "#fff3b0";
            } else {
                row.style.backgroundColor = "#ff9999";
            }

            tbody.appendChild(row);
        });

        const titleEl = document.getElementById("totalTitle");
        if (titleEl) titleEl.textContent = "Total Attendance (" + totalSessions + " Sessions)";

        console.log(" Table rendered successfully!");
        setupButtons(totalSessions);

    } catch (err) {
        console.error("!! Error loading totalList:", err);
        tbody.innerHTML = "<tr><td colspan='5'>Error loading data: " + err.message + "</td></tr>";
    }
}

function setupButtons(ts) {
    console.log(" Setting up buttons with totalSessions =", ts);

    document.getElementById("showReportBtn").addEventListener("click", function() {
        console.log(" Show Report clicked");
        
        let totalStudents = 0;
        let presentCount = 0;
        let participatedCount = 0;

        document.querySelectorAll("#totalTableBody tr").forEach(function(row) {
            totalStudents++;
            const present = parseInt(row.querySelector("td:nth-child(4)").textContent) || 0;
            const participated = parseInt(row.querySelector("td:nth-child(5)").textContent) || 0;

            if (present > 0) presentCount++;
            if (participated > 0) participatedCount++;
        });

        const absentCount = totalStudents - presentCount;

        console.log(" Report stats:", { totalStudents, presentCount, absentCount, participatedCount });

        document.getElementById("totalStudents").textContent = totalStudents;
        document.getElementById("totalPresent").textContent = presentCount;
        document.getElementById("totalAbsent").textContent = absentCount;
        document.getElementById("totalParticipated").textContent = participatedCount;

        document.getElementById("reportSection").style.display = "block";

        try {
            console.log(" Creating chart...");
            var canvas = document.getElementById("attendanceChart");
            if (!canvas) {
                console.error("!! Canvas element not found!");
                return;
            }
            
            var ctx = canvas.getContext("2d");
            if (!ctx) {
                console.error("!! Could not get canvas context!");
                return;
            }
            
            if (window.attendanceChart && typeof window.attendanceChart.destroy === "function") {
                try {
                    window.attendanceChart.destroy();
                    console.log("  Old chart destroyed");
                } catch (destroyErr) {
                    console.warn(" Could not destroy old chart:", destroyErr);
                }
            }
            
            window.attendanceChart = new Chart(ctx, {
                type: "pie",
                data: {
                    labels: ["Present", "Absent", "Participated"],
                    datasets: [{
                        data: [presentCount, absentCount, participatedCount],
                        backgroundColor: ["#4CAF50", "#ff9999", "#c8f7c5"],
                        borderColor: ["#388e3c", "#ff9999", "#c8f7c5"],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: "bottom"
                        }
                    }
                }
            });
            console.log(" Chart created successfully!");
        } catch (err) {
            console.error("!! Chart error:", err);
            console.error("Stack:", err.stack);
        }
    });

    document.getElementById("highlightBtn").addEventListener("click", function() {
        console.log("⭐ Highlight Excellent Students clicked");
        
        document.querySelectorAll("#totalTableBody tr").forEach(function(row) {
            const present = parseInt(row.querySelector("td:nth-child(4)").textContent) || 0;
            const absences = ts - present;

            if (absences < 2) {
                row.style.backgroundColor = "#ffeb3b";
                row.style.fontWeight = "bold";
            }
        });
    });

    document.getElementById("resetBtn").addEventListener("click", function() {
        console.log(" Reset Colors clicked");
        
        document.querySelectorAll("#totalTableBody tr").forEach(function(row) {
            const present = parseInt(row.querySelector("td:nth-child(4)").textContent) || 0;
            const absences = ts - present;

            if (absences < 2) {
                row.style.backgroundColor = "#c8f7c5";
            } else if (absences < 3) {
                row.style.backgroundColor = "#fff3b0";
            } else if (absences < 4) {
                row.style.backgroundColor = "#ffcccb";
            } else {
                row.style.backgroundColor = "#ff9999";
            }
            row.style.fontWeight = "normal";
        });
    });

    document.getElementById("searchInput").addEventListener("keyup", function(e) {
        const searchValue = e.target.value.toLowerCase();
        console.log(" Search:", searchValue);

        document.querySelectorAll("#totalTableBody tr").forEach(function(row) {
            const lastName = row.querySelector("td:nth-child(2)").textContent.toLowerCase();
            const firstName = row.querySelector("td:nth-child(3)").textContent.toLowerCase();

            const match = lastName.includes(searchValue) || firstName.includes(searchValue);
            row.style.display = match ? "" : "none";
        });
    });

    document.getElementById("sortAbsencesBtn").addEventListener("click", function() {
        console.log(" Sort by Absences clicked");
        
        const rows = Array.from(document.querySelectorAll("#totalTableBody tr"));
        
        rows.sort(function(a, b) {
            const presentA = parseInt(a.querySelector("td:nth-child(4)").textContent) || 0;
            const presentB = parseInt(b.querySelector("td:nth-child(4)").textContent) || 0;
            const absA = ts - presentA;
            const absB = ts - presentB;
            return absA - absB;
        });

        const tbody = document.getElementById("totalTableBody");
        tbody.innerHTML = "";
        rows.forEach(function(row) {
            tbody.appendChild(row);
        });
        
        console.log(" Sorted by absences (lowest first)");
    });

    document.getElementById("sortParticipationBtn").addEventListener("click", function() {
        console.log(" Sort by Participation clicked");
        
        const rows = Array.from(document.querySelectorAll("#totalTableBody tr"));
        
        rows.sort(function(a, b) {
            const partA = parseInt(a.querySelector("td:nth-child(5)").textContent) || 0;
            const partB = parseInt(b.querySelector("td:nth-child(5)").textContent) || 0;
            return partB - partA;
        });

        const tbody = document.getElementById("totalTableBody");
        tbody.innerHTML = "";
        rows.forEach(function(row) {
            tbody.appendChild(row);
        });
        
        console.log(" Sorted by participation (highest first)");
    });

    console.log(" All buttons configured");
}

if (document.readyState === "loading") {
    console.log(" Waiting for DOM...");
    document.addEventListener("DOMContentLoaded", initTotalList);
} else {
    console.log(" DOM ready, starting immediately");
    initTotalList();
}
