const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', '\u0412\u043e\u0432\u0430', 'Desktop', '\u0421\u043f\u0438\u0441\u043e\u043a \u0437\u0430\u0432\u0434\u0430\u043d\u044c', '6TODOIST_FULL_FINAL_FIXED.html');

let src = fs.readFileSync(filePath, 'utf8');
console.log('Original size:', src.length);

// Fix 1: Replace deprecated ReactDOM.render with createRoot (React 18)
const old1 = "ReactDOM.render(<TodoistApp />, document.getElementById('root'));";
const new1 = "const root = ReactDOM.createRoot(document.getElementById('root'));\n        root.render(<TodoistApp />);";
if (src.includes(old1)) {
    src = src.replace(old1, new1);
    console.log('Fix 1 applied: ReactDOM.createRoot');
} else {
    console.log('Fix 1 SKIPPED');
}

// Fix 2: Fix infinite loop in projects useEffect
const old2 = `            // \u041e\u043d\u043e\u0432\u043b\u0435\u043d\u043d\u044f \u043a\u0456\u043b\u044c\u043a\u043e\u0441\u0442\u0456 \u0437\u0430\u0434\u0430\u0447 \u0443 \u043f\u0440\u043e\u0435\u043a\u0442\u0430\u0445
            useEffect(() => {
                const updatedProjects = projects.map(project => ({
                    ...project,
                    taskCount: tasks.filter(task => task.project === project.id).length
                }));
                if (JSON.stringify(updatedProjects) !== JSON.stringify(projects)) {
                    setProjects(updatedProjects);
                }
            }, [tasks]);`;
const new2 = `            // \u041e\u043d\u043e\u0432\u043b\u0435\u043d\u043d\u044f \u043a\u0456\u043b\u044c\u043a\u043e\u0441\u0442\u0456 \u0437\u0430\u0434\u0430\u0447 \u0443 \u043f\u0440\u043e\u0435\u043a\u0442\u0430\u0445 (\u0432\u0438\u043f\u0440.)
            useEffect(() => {
                setProjects(prev => prev.map(project => ({
                    ...project,
                    taskCount: tasks.filter(task => task.project === project.id).length
                })));
            }, [tasks]);`;
if (src.includes(old2)) {
    src = src.replace(old2, new2);
    console.log('Fix 2 applied: infinite loop fix');
} else {
    console.log('Fix 2 SKIPPED');
}

// Fix 3: selectedTask sync after columns localStorage effect
const anchor3 = `            useEffect(() => {
                saveToLocalStorage('todoist-columns', columns);
            }, [columns]);`;
const insert3 = `

            // \u0421\u0438\u043d\u0445\u0440\u043e\u043d\u0456\u0437\u0430\u0446\u0456\u044f selectedTask \u043f\u0440\u0438 \u0437\u043c\u0456\u043d\u0456 tasks
            useEffect(() => {
                if (selectedTask) {
                    const updated = tasks.find(t => t.id === selectedTask.id);
                    if (updated) setSelectedTask(updated);
                    else { setShowTaskDetail(false); setSelectedTask(null); }
                }
            }, [tasks]);`;
if (src.includes(anchor3)) {
    src = src.replace(anchor3, anchor3 + insert3);
    console.log('Fix 3 applied: selectedTask sync');
} else {
    console.log('Fix 3 SKIPPED');
}

// Fix 4: DnD - destroy old sortable instances before recreating
const old4_part = `                    if (element && !sortableRefs.current[column.id]) {`;
const new4_part = `                    if (element) {`;
if (src.includes(old4_part)) {
    src = src.replace(old4_part, new4_part);
    console.log('Fix 4a applied: removed stale instance check');
} else {
    console.log('Fix 4a SKIPPED');
}

const old4_init = `            useEffect(() => {
                columns.forEach(column => {`;
const new4_init = `            useEffect(() => {
                Object.values(sortableRefs.current).forEach(s => s && s.destroy && s.destroy());
                sortableRefs.current = {};
                columns.forEach(column => {`;
// Only replace the DnD one, not others - find correct occurrence
const dndIdx = src.indexOf('// \u0406\u043d\u0456\u0446\u0456\u0430\u043b\u0456\u0437\u0430\u0446\u0456\u044f drag and drop');
if (dndIdx >= 0) {
    const before = src.substring(0, dndIdx);
    let after = src.substring(dndIdx);
    after = after.replace(old4_init, new4_init);
    src = before + after;
    console.log('Fix 4b applied: destroy DnD before recreate');
} else {
    console.log('Fix 4b SKIPPED');
}

fs.writeFileSync(filePath, src, 'utf8');
console.log('New size:', src.length);
console.log('Done!');
