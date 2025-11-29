document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("classContainer");
    console.log(" classe.js loaded, container:", container);
    
    // Get teacher_id from URL parameter or prompt user to select
    const params = new URLSearchParams(window.location.search);
    let teacherId = params.get('teacher_id');
    console.log(" teacher_id from URL:", teacherId);

    if (!teacherId) {
        console.log("  No teacher_id in URL, loading teacher selector...");
        // No teacher_id in URL — show teacher selector
        try {
            console.log(" Fetching teachers from API...");
            const res = await fetch('/attendance_app/api/loginTeacher.php?all=1');
            const teachers = await res.json();
            console.log(" Teachers loaded:", teachers);

            if (!Array.isArray(teachers) || teachers.length === 0) {
                console.error(" No teachers found");
                container.innerHTML = '<p style="color:red">No teachers found in database.</p>';
                return;
            }

            // Build selector UI
            console.log("  Building teacher selector UI...");
            container.innerHTML = '<div id="teacher-selector"><p><strong>Select your teacher account:</strong></p></div>';
            const selectorDiv = document.getElementById('teacher-selector');

            const select = document.createElement('select');
            select.id = 'teacherSelect';
            select.style.padding = '8px';
            select.style.marginRight = '8px';

            teachers.forEach(t => {
                const option = document.createElement('option');
                option.value = t.teacher_id;
                option.textContent = `${t.first_name} ${t.last_name}`;
                select.appendChild(option);
            });

            const btn = document.createElement('button');
            btn.textContent = 'Load My Classes';
            btn.style.padding = '8px 16px';
            btn.style.cursor = 'pointer';
            btn.onclick = () => {
                const selected = select.value;
                console.log("Teacher selected:", selected);
                if (selected) {
                    // Redirect to this page with teacher_id
                    window.location.href = `/attendance_app/pages/classe.html?teacher_id=${selected}`;
                }
            };

            selectorDiv.appendChild(select);
            selectorDiv.appendChild(btn);
            console.log(" Teacher selector UI built");
        } catch (err) {
            console.error(' Error loading teachers:', err);
            container.innerHTML = '<p style="color:red">Error loading teachers.</p>';
        }
        return;
    }

    // We have a teacher_id — load their classes
    console.log("Loading classes for teacher_id:", teacherId);

    try {
        const apiUrl = `/attendance_app/api/teacher_groups.php?teacher_id=${encodeURIComponent(teacherId)}`;
        console.log("Fetching from API:", apiUrl);
        const res = await fetch(apiUrl);
        console.log(" Response status:", res.status);
        const groups = await res.json();

        console.log(" API response groups:", groups);
        console.log(" Number of groups:", Array.isArray(groups) ? groups.length : "not an array");

        if (!Array.isArray(groups) || groups.length === 0) {
            console.warn("!!!!!!!! No groups returned or not an array");
            container.innerHTML = '<p>No groups assigned to this teacher.</p>';
            return;
        }

        // Group rows by module_id
        console.log(" Organizing groups by module...");
        const modules = {};
        
        groups.forEach(group => {
            // group = { group_id, group_name, modules: [ {module_id, module_name}, ... ] }
            const modules_array = group.modules || [];
            
            modules_array.forEach(mod => {
                const mid = mod.module_id;
                const mname = mod.module_name;
                const gid = group.group_id;
                const gname = group.group_name;
                
                console.log(`  Processing: module_id=${mid}, module_name=${mname}, group_id=${gid}, group_name=${gname}`);

                if (!modules[mid]) {
                    modules[mid] = { id: mid, name: mname, groups: [] };
                }
                // Avoid duplicate groups
                if (!modules[mid].groups.find(g => g.id === gid)) {
                    modules[mid].groups.push({ id: gid, name: gname });
                }
            });
        });

        console.log(" Grouped modules:", modules);
        console.log(" Number of modules:", Object.keys(modules).length);

        if (Object.keys(modules).length === 0) {
            console.warn("⚠️  No modules found after grouping");
            container.innerHTML = '<p>No modules found for this teacher\'s groups.</p>';
            return;
        }

        container.innerHTML = '';

        // Render modules
        console.log(" Rendering modules...");
        Object.values(modules).forEach((module, idx) => {
            console.log(`  Rendering module ${idx + 1}: ${module.name} (${module.groups.length} groups)`);
            const card = document.createElement('div');
            card.className = 'class-block';
            card.style.marginBottom = '30px';

            const title = document.createElement('p');
            title.className = 'module-name';
            title.textContent = module.name;
            card.appendChild(title);

            module.groups.forEach(group => {
                const link = document.createElement('a');
                link.href = `/attendance_app/pages/session.html?group_id=${encodeURIComponent(group.id)}&module_id=${encodeURIComponent(module.id)}`;
                
                const btn = document.createElement('button');
                btn.className = 'section-btn';
                btn.textContent = group.name;
                
                link.appendChild(btn);
                card.appendChild(link);
            });

            container.appendChild(card);
        });
        console.log(" All modules rendered successfully");

    } catch (err) {
        console.error(" Error loading classes:", err);
        console.error("Stack:", err.stack);
        container.innerHTML = '<p style="color:red">Error loading classes: ' + err.message + '</p>';
    }
});
