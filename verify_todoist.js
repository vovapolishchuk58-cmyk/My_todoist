const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', '\u0412\u043e\u0432\u0430', 'Desktop', '\u0421\u043f\u0438\u0441\u043e\u043a \u0437\u0430\u0432\u0434\u0430\u043d\u044c', '6TODOIST_FULL_FINAL_FIXED.html');
const src = fs.readFileSync(filePath, 'utf8');

const checks = [
    ['ReactDOM.createRoot', 'Fix 1: createRoot'],
    ['setProjects(prev => prev.map', 'Fix 2: functional setProjects'],
    ['\u0421\u0438\u043d\u0445\u0440\u043e\u043d\u0456\u0437\u0430\u0446\u0456\u044f selectedTask', 'Fix 3: selectedTask sync'],
    ['\u0417\u043d\u0438\u0449\u0443\u0454\u043c\u043e \u0441\u0442\u0430\u0440\u0456 \u0435\u043a\u0437\u0435\u043c\u043f\u043b\u044f\u0440\u0438', 'Fix 4: DnD destroy'],
    ['ReactDOM.render', 'OLD: deprecated render (should be gone)'],
];

checks.forEach(([needle, label]) => {
    const found = src.includes(needle);
    console.log(`${found ? 'YES' : 'NO '} - ${label}`);
});
