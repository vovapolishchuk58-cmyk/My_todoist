import * as ReactModule from 'react';
const React = ReactModule.default || ReactModule;
const { useState, useEffect, useCallback, useMemo } = React;
import Sidebar from './components/Sidebar';
import KanbanBoard from './components/KanbanBoard';
import { TaskModal, TaskDetailModal, ProjectModal, LabelModal, TeamModal, DeleteConfirmationModal } from './components/Modals';
import ToastNotification from './components/Notification';
import ReminderNotification from './components/ReminderNotification';

const App = () => {
    // --- Initial Data ---
    const initialProjects = [
        { id: 'inbox', name: 'Вхідні', color: '#246fe0', taskCount: 0 },
        { id: 'work', name: 'Робота', color: '#dc4c3e', taskCount: 0 },
        { id: 'personal', name: 'Особисте', color: '#884dff', taskCount: 0 }
    ];

    const initialLabels = [
        { id: 'urgent', name: 'Терміново', color: '#dc4c3e' },
        { id: 'important', name: 'Важливо', color: '#ff9a14' }
    ];

    const initialTeamMembers = [
        { id: 'user1', name: 'Артем Кравченко', email: 'artem@example.com', avatar: 'АК' },
        { id: 'user2', name: 'Олена Петрова', email: 'olena@example.com', avatar: 'ОП' }
    ];

    const initialColumns = [];

    // --- State Management ---
    const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('todoist_tasks')) || []);
    const [projects, setProjects] = useState(() => JSON.parse(localStorage.getItem('todoist_projects')) || initialProjects);
    const [labels, setLabels] = useState(() => JSON.parse(localStorage.getItem('todoist_labels')) || initialLabels);
    const [teamMembers, setTeamMembers] = useState(() => JSON.parse(localStorage.getItem('todoist_team')) || initialTeamMembers);
    const [subtasks, setSubtasks] = useState(() => JSON.parse(localStorage.getItem('todoist_subtasks')) || []);
    const [comments, setComments] = useState(() => JSON.parse(localStorage.getItem('todoist_comments')) || []);
    const [files, setFiles] = useState(() => JSON.parse(localStorage.getItem('todoist_files')) || []);
    const [columns, setColumns] = useState(() => {
        const resetKey = 'todoist_reset_v4';
        const hasReset = localStorage.getItem(resetKey);
        if (!hasReset) {
            localStorage.removeItem('todoist_columns');
            localStorage.setItem(resetKey, 'true');
            return [];
        }
        const saved = localStorage.getItem('todoist_columns');
        return saved ? JSON.parse(saved) : [];
    });

    // --- Repair Hidden Tasks ---
    useEffect(() => {
        const hasDoneCol = columns.some(c => c.id === 'done');
        if (!hasDoneCol && columns.length > 0) {
            const hasTasksInDone = tasks.some(t => t.column === 'done');
            if (hasTasksInDone) {
                setTasks(prev => prev.map(t => t.column === 'done' ? { ...t, column: columns[0].id } : t));
            }
        }
    }, []);

    const [currentFilter, setCurrentFilter] = useState('all');
    const [selectedProject, setSelectedProject] = useState('all');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [notification, setNotification] = useState(null);
    const [activeReminders, setActiveReminders] = useState([]);
    const [showCompleted, setShowCompleted] = useState(false);

    // --- Modal State ---
    const [activeModal, setActiveModal] = useState({ type: null, data: null });

    // --- Notification Helper ---
    const notify = useCallback((message, type = 'success') => {
        setNotification({ message, type });
    }, []);

    // --- Persistence ---
    useEffect(() => {
        localStorage.setItem('todoist_tasks', JSON.stringify(tasks));
        localStorage.setItem('todoist_projects', JSON.stringify(projects));
        localStorage.setItem('todoist_labels', JSON.stringify(labels));
        localStorage.setItem('todoist_team', JSON.stringify(teamMembers));
        localStorage.setItem('todoist_subtasks', JSON.stringify(subtasks));
        localStorage.setItem('todoist_comments', JSON.stringify(comments));
        localStorage.setItem('todoist_files', JSON.stringify(files));
        localStorage.setItem('todoist_columns', JSON.stringify(columns));
    }, [tasks, projects, labels, teamMembers, subtasks, comments, files, columns]);

    // --- Desktop Notification Permission ---
    useEffect(() => {
        if ('Notification' in window && window.Notification.permission === 'default') {
            window.Notification.requestPermission();
        }
    }, []);

    // --- Periodic Due Date Check ---
    useEffect(() => {
        const checkInterval = setInterval(() => {
            const now = new Date();
            // Match the shifted-ISO format used by CustomDatePicker for local time
            const offset = now.getTimezoneOffset();
            const localNow = new Date(now.getTime() - (offset * 60 * 1000));
            const nowStr = localNow.toISOString().substring(0, 16);

            tasks.forEach(task => {
                if (task.dueDate && !task.completed) {
                    // Check if dueDate contains the current minute string
                    if (task.dueDate.includes(nowStr)) {
                        const lastNotified = localStorage.getItem(`notified_${task.id}`);
                        if (lastNotified !== nowStr) {
                            const msg = `Настав час для задачі: ${task.content}`;
                            notify(msg, 'info');

                            if ('Notification' in window && window.Notification.permission === 'granted') {
                                try {
                                    new window.Notification('Нагадування', {
                                        body: msg,
                                        icon: '/favicon.ico'
                                    });
                                } catch (e) {
                                    console.error('Desktop notification failed', e);
                                }
                            }
                            setActiveReminders(prev => {
                                if (prev.find(r => r.id === task.id)) return prev;
                                return [...prev, task];
                            });
                            localStorage.setItem(`notified_${task.id}`, nowStr);
                        }
                    }
                }
            });
        }, 15000); // Check every 15 seconds

        return () => clearInterval(checkInterval);
    }, [tasks, notify]);


    // --- CRUD Handlers ---

    // Tasks
    const handleTaskSave = useCallback((taskData) => {
        setTasks(prev => {
            const exists = prev.find(t => String(t.id) === String(taskData.id));
            if (exists) {
                notify('Задачу оновлено');
                return prev.map(t => String(t.id) === String(taskData.id) ? taskData : t);
            }
            notify('Задачу створено');
            return [...prev, taskData];
        });
        setActiveModal({ type: null, data: null });
    }, [notify]);

    const handleTaskDelete = useCallback((taskId) => {
        const idStr = String(taskId);
        setTasks(prev => prev.filter(t => String(t.id) !== idStr));
        setSubtasks(prev => prev.filter(s => String(s.parentId) !== idStr));
        setComments(prev => prev.filter(c => String(c.taskId) !== idStr));
        setFiles(prev => prev.filter(f => String(f.taskId) !== idStr));
        notify('Задачу видалено', 'warning');
        setActiveModal({ type: null, data: null });
    }, [notify]);

    const handleToggleComplete = useCallback((taskId) => {
        const idStr = String(taskId);
        setTasks(prev => prev.map(t => String(t.id) === idStr ? { ...t, completed: !t.completed } : t));
    }, []);

    const handleTaskMove = useCallback((taskId, newColumn) => {
        const idStr = String(taskId);
        setTasks(prev => prev.map(t => String(t.id) === idStr ? { ...t, column: newColumn, completed: newColumn === 'done' } : t));
    }, []);

    // Subtasks
    const handleAddSubtask = useCallback((parentId, content) => {
        setSubtasks(prev => [...prev, { id: Date.now().toString(), parentId, content, completed: false }]);
        notify('Підзадачу додано');
    }, [notify]);

    const handleToggleSubtask = useCallback((id) => {
        setSubtasks(prev => prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
    }, []);

    const handleDeleteSubtask = useCallback((id) => {
        setSubtasks(prev => prev.filter(s => s.id !== id));
        notify('Підзадачу видалено', 'info');
    }, [notify]);

    // Comments & Files
    const handleAddComment = useCallback((taskId, content) => {
        setComments(prev => [...prev, { id: Date.now().toString(), taskId, content, createdAt: Date.now() }]);
        notify('Коментар додано');
    }, [notify]);

    const handleDeleteComment = useCallback((id) => {
        setComments(prev => prev.filter(c => c.id !== id));
    }, []);

    const handleAddFile = useCallback((taskId, fileData) => {
        setFiles(prev => [...prev, { ...fileData, taskId }]);
        notify('Файл додано');
    }, [notify]);

    const handleDeleteFile = useCallback((id) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    }, []);

    // Projects, Labels, Team
    const handleProjectSave = useCallback((data) => {
        setProjects(prev => {
            const exists = prev.find(p => p.id === data.id);
            return exists ? prev.map(p => p.id === data.id ? data : p) : [...prev, data];
        });
        notify(data.id ? 'Проект оновлено' : 'Проект створено');
    }, [notify]);

    const handleProjectDelete = useCallback((id) => {
        if (id === 'inbox') return;
        setProjects(prev => prev.filter(p => p.id !== id));
        setTasks(prev => prev.map(t => t.project === id ? { ...t, project: 'inbox' } : t));
        notify('Проект видалено');
        if (selectedProject === id) setSelectedProject('all');
    }, [selectedProject, notify]);

    const handleLabelSave = useCallback((data) => {
        setLabels(prev => prev.find(l => l.id === data.id) ? prev.map(l => l.id === data.id ? data : l) : [...prev, data]);
        notify('Мітку збережено');
    }, [notify]);

    const handleLabelDelete = useCallback((id) => {
        setLabels(prev => prev.filter(l => l.id !== id));
        setTasks(prev => prev.map(t => ({ ...t, labels: t.labels?.filter(lid => lid !== id) || [] })));
    }, []);

    const handleTeamSave = useCallback((data) => {
        setTeamMembers(prev => prev.find(m => m.id === data.id) ? prev.map(m => m.id === data.id ? data : m) : [...prev, data]);
        notify('Учасника додано');
    }, [notify]);

    const handleTeamDelete = useCallback((id) => {
        setTeamMembers(prev => prev.filter(m => m.id !== id));
        setTasks(prev => prev.map(t => t.assignedTo === id ? { ...t, assignedTo: '' } : t));
    }, []);

    // Kanban Columns
    const handleAddColumn = useCallback((name) => {
        const newCol = { id: `col-${Date.now()}`, name };
        setColumns(prev => [...prev, newCol]);
        notify('Колонку додано');
    }, [notify]);

    const handleDeleteColumn = useCallback((id) => {
        setColumns(prev => prev.filter(c => c.id !== id));
        notify('Колонку видалено', 'warning');
    }, [notify]);

    const handleUpdateColumn = useCallback((id, name) => {
        setColumns(prev => prev.map(c => c.id === id ? { ...c, name } : c));
        notify('Розділ оновлено');
    }, [notify]);

    const handleMoveColumn = useCallback((fromIndex, toIndex) => {
        setColumns(prev => {
            const result = Array.from(prev);
            const [removed] = result.splice(fromIndex, 1);
            result.splice(toIndex, 0, removed);
            return result;
        });
    }, []);

    // --- Helpers ---
    const filteredTasks = useMemo(() => {
        let result = tasks || [];

        // Filter by completed status (unless we are in the dedicated 'completed' view)
        if (!showCompleted && currentFilter !== 'completed') {
            result = result.filter(t => !t.completed);
        }

        if (selectedProject !== 'all') {
            result = result.filter(t => t.project === selectedProject);
        }
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        switch (currentFilter) {
            case 'today':
                return result.filter(t => t.dueDate && new Date(t.dueDate).setHours(0, 0, 0, 0) === now.getTime());
            case 'upcoming':
                return result.filter(t => t.dueDate && new Date(t.dueDate).setHours(0, 0, 0, 0) > now.getTime());
            case 'overdue':
                return result.filter(t => t.dueDate && new Date(t.dueDate).setHours(0, 0, 0, 0) < now.getTime());
            case 'completed':
                return result.filter(t => t.completed);
            default:
                return result;
        }
    }, [tasks, selectedProject, currentFilter, showCompleted]);

    return (
        <div className="todoist-app flex h-screen overflow-hidden bg-white">
            {notification && <ToastNotification {...notification} onClose={() => setNotification(null)} />}

            {activeReminders.length > 0 && (
                <ReminderNotification
                    task={activeReminders[0]}
                    onClose={() => setActiveReminders(prev => prev.slice(1))}
                    onComplete={(taskId) => {
                        handleToggleComplete(taskId);
                        setActiveReminders(prev => prev.filter(r => r.id !== taskId));
                    }}
                    onSnooze={(taskId) => {
                        const task = tasks.find(t => String(t.id) === String(taskId));
                        if (task) {
                            const d = new Date(task.dueDate);
                            d.setMinutes(d.getMinutes() + 15);
                            const offset = d.getTimezoneOffset();
                            const localDate = new Date(d.getTime() - (offset * 60 * 1000));
                            const newDateStr = localDate.toISOString().substring(0, 16);
                            handleTaskSave({ ...task, dueDate: newDateStr });
                        }
                        setActiveReminders(prev => prev.filter(r => r.id !== taskId));
                    }}
                />
            )}

            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                currentFilter={currentFilter}
                setCurrentFilter={setCurrentFilter}
                selectedProject={selectedProject}
                setSelectedProject={setSelectedProject}
                projects={projects}
                labels={labels}
                teamMembers={teamMembers}
                onAddProject={() => setActiveModal({ type: 'project', data: null })}
                onEditProject={(p) => setActiveModal({ type: 'project', data: p })}
                onDeleteProject={handleProjectDelete}
                onAddLabel={() => setActiveModal({ type: 'label', data: null })}
                onEditLabel={(l) => setActiveModal({ type: 'label', data: l })}
                onDeleteLabel={handleLabelDelete}
                onAddMember={() => setActiveModal({ type: 'team', data: null })}
                onEditMember={(m) => setActiveModal({ type: 'team', data: m })}
                onDeleteMember={handleTeamDelete}
                tasks={tasks}
            />

            <main className={`todoist-main flex-1 transition-all duration-300 ${sidebarOpen ? 'pl-[280px]' : 'pl-0'}`}>
                <div className="h-full flex flex-col">
                    <header className="todoist-header h-[64px] border-b border-sidebar-border px-8 flex items-center justify-between bg-white shrink-0">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-sidebar-hover rounded text-sidebar-text-secondary transition-colors">
                                <i className={`fas ${sidebarOpen ? 'fa-indent' : 'fa-outdent'}`}></i>
                            </button>
                            <h1 className="text-xl font-extrabold text-[#202020] tracking-tight">
                                {selectedProject !== 'all'
                                    ? projects.find(p => p.id === selectedProject)?.name
                                    : (currentFilter === 'today' ? 'Сьогодні' :
                                        currentFilter === 'upcoming' ? 'Наступні' :
                                            currentFilter === 'overdue' ? 'Протерміновані' :
                                                currentFilter === 'completed' ? 'Завершені' : 'Всі задачі')}
                            </h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setActiveModal({ type: 'task_edit', data: null })}
                                className="todoist-btn-primary todoist-btn py-2 px-5 text-sm font-bold shadow-sm whitespace-nowrap"
                            >
                                Додати задачу
                            </button>
                            <button
                                onClick={() => setShowCompleted(!showCompleted)}
                                className={`flex items-center gap-2 py-2 px-4 text-sm font-bold rounded-lg border transition-all ${showCompleted
                                    ? 'bg-[#ff9a14] text-white border-[#ff9a14] shadow-md hover:bg-[#e68a10]'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 shadow-sm'
                                    }`}
                                title={showCompleted ? 'Приховати завершені' : 'Показати завершені'}
                            >
                                <i className={`fas ${showCompleted ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                <span>{showCompleted ? 'Приховати завершені' : 'Завершені'}</span>
                            </button>
                        </div>
                    </header>

                    <div className="flex-1 overflow-x-auto overflow-y-visible scrollbar-hide">
                        <KanbanBoard
                            tasks={filteredTasks}
                            columns={columns}
                            onTaskMove={handleTaskMove}
                            onTaskClick={(task) => {
                                if (task && task.id) {
                                    setActiveModal({ type: 'task_detail', data: task });
                                } else {
                                    setActiveModal({ type: 'task_edit', data: task });
                                }
                            }}
                            onToggleComplete={handleToggleComplete}
                            onAddColumn={handleAddColumn}
                            onUpdateColumn={handleUpdateColumn}
                            onDeleteColumn={handleDeleteColumn}
                            onMoveColumn={handleMoveColumn}
                            onSaveTask={handleTaskSave}
                            onTaskDelete={(taskId) => {
                                const task = tasks.find(t => String(t.id) === String(taskId));
                                setActiveModal({ type: 'task_delete', data: task });
                            }}
                            onAddFile={handleAddFile}
                            subtasks={subtasks}
                            comments={comments}
                            files={files}
                            labels={labels}
                            teamMembers={teamMembers}
                        />
                    </div>
                </div>
            </main>

            {/* Modals */}
            {activeModal.type === 'task_edit' && (
                <TaskModal
                    task={activeModal.data}
                    projects={projects}
                    labels={labels}
                    teamMembers={teamMembers}
                    onSave={handleTaskSave}
                    onClose={() => setActiveModal({ type: null, data: null })}
                />
            )}
            {activeModal.type === 'task_detail' && (
                <TaskDetailModal
                    task={tasks.find(t => t.id === activeModal.data.id)}
                    subtasks={subtasks}
                    comments={comments}
                    files={files}
                    labels={labels}
                    teamMembers={teamMembers}
                    onClose={() => setActiveModal({ type: null, data: null })}
                    onEdit={(task) => setActiveModal({ type: 'task_edit', data: task })}
                    onDelete={() => setActiveModal({ type: 'task_delete', data: tasks.find(t => t.id === activeModal.data.id) })}
                    onToggleComplete={handleToggleComplete}
                    onAddSubtask={handleAddSubtask}
                    onToggleSubtask={handleToggleSubtask}
                    onDeleteSubtask={handleDeleteSubtask}
                    onAddComment={handleAddComment}
                    onDeleteComment={handleDeleteComment}
                    onAddFile={handleAddFile}
                    onDeleteFile={handleDeleteFile}
                />
            )}
            {activeModal.type === 'project' && (
                <ProjectModal
                    project={activeModal.data}
                    onSave={handleProjectSave}
                    onClose={() => setActiveModal({ type: null, data: null })}
                />
            )}
            {activeModal.type === 'label' && (
                <LabelModal
                    label={activeModal.data}
                    onSave={handleLabelSave}
                    onClose={() => setActiveModal({ type: null, data: null })}
                />
            )}
            {activeModal.type === 'team' && (
                <TeamModal
                    member={activeModal.data}
                    onSave={handleTeamSave}
                    onClose={() => setActiveModal({ type: null, data: null })}
                />
            )}
            {activeModal.type === 'task_delete' && (
                <DeleteConfirmationModal
                    task={activeModal.data}
                    onConfirm={handleTaskDelete}
                    onClose={() => setActiveModal({ type: null, data: null })}
                />
            )}
        </div>
    );
};

export default App;
