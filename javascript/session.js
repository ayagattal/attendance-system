// ============================================================
// session.js — show session list for a group
// ============================================================

// Read URL params
const urlParams = new URLSearchParams(window.location.search);
const moduleId = urlParams.get("module_id");
const groupId = urlParams.get("group_id");

// DOM
const title = document.getElementById("sessionListTitle");
const container = document.getElementById("sessionListContainer");

async function initSessionPage() {
    if (!groupId) {
        container.innerHTML = '<p>Error: No group_id provided</p>';
        return;
    }

    console.log("📚 Loading sessions for group_id:", groupId);

    try {
        // Fetch sessions for this group
        const res = await fetch(`/attendance_app/api/sessions.php?group_id=${encodeURIComponent(groupId)}`);
        const sessions = await res.json();

        console.log("✅ Sessions loaded:", sessions);

        if (!Array.isArray(sessions) || sessions.length === 0) {
            container.innerHTML = '<p>No sessions available for this group.</p>';
            return;
        }

        // Set title
        const groupText = `Group ${groupId}`;
        const moduleText = moduleId ? `Module ${moduleId}` : '';
        title.innerText = `${moduleText} — ${groupText}`.trim();

        // Generate session buttons
        sessions.forEach(sess => {
            const div = document.createElement("div");
            div.className = "session-item";

            const link = document.createElement("a");
            link.href = `/attendance_app/pages/sessiontable.html?group_id=${encodeURIComponent(groupId)}&module_id=${moduleId || ''}&session=${sess.session_number}`;
            
            const btn = document.createElement("button");
            btn.className = "session-btn";
            btn.textContent = `Session ${sess.session_number}`;
            
            link.appendChild(btn);
            div.appendChild(link);
            container.appendChild(div);
        });

        // TOTAL button
        const totalDiv = document.createElement("div");
        totalDiv.className = "session-item";
        
        const totalLink = document.createElement("a");
        totalLink.href = `/attendance_app/pages/totalList.html?group_id=${encodeURIComponent(groupId)}&module_id=${moduleId || ''}`;
        
        const totalBtn = document.createElement("button");
        totalBtn.className = "session-btn total";
        totalBtn.textContent = "TOTAL";
        
        totalLink.appendChild(totalBtn);
        totalDiv.appendChild(totalLink);
        container.appendChild(totalDiv);

    } catch (err) {
        console.error("❌ Error loading sessions:", err);
        container.innerHTML = '<p>Error loading sessions.</p>';
    }
}

initSessionPage();
