import * as ReactModule from 'react';
const React = ReactModule.default || ReactModule;
import {
    Inbox,
    Calendar,
    Layers,
    Hash,
    Plus,
    Filter,
    Users,
    Circle,
    ChevronRight,
    MoreHorizontal,
    Edit3,
    Trash2,
    Settings,
    Tag,
    CheckCircle2
} from 'lucide-react';

const Sidebar = ({
    sidebarOpen,
    currentFilter,
    setCurrentFilter,
    selectedProject,
    setSelectedProject,
    projects = [],
    labels = [],
    teamMembers = [],
    onAddProject,
    onEditProject,
    onDeleteProject,
    onAddLabel,
    onEditLabel,
    onDeleteLabel,
    onAddMember,
    onEditMember,
    onDeleteMember,
    tasks = []
}) => {
    const filters = [
        { id: 'all', name: 'Всі задачі', icon: <Inbox size={18} />, color: 'text-blue-500' },
        { id: 'today', name: 'Сьогодні', icon: <Calendar size={18} />, color: 'text-green-500' },
        { id: 'upcoming', name: 'Наступні', icon: <Layers size={18} />, color: 'text-purple-500' },
        { id: 'overdue', name: 'Протерміновані', icon: <Filter size={18} />, color: 'text-red-500' },
        { id: 'completed', name: 'Завершені', icon: <CheckCircle2 size={18} />, color: 'text-orange-500' },
    ];

    const getCount = (projectId) => {
        return tasks.filter(t => t.project === projectId && !t.completed).length;
    };

    const SidebarItem = ({ id, name, icon, count, isActive, onClick, color, onEdit, onDelete, canManage = true }) => (
        <div
            className={`group flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors ${isActive ? 'bg-sidebar-hover text-sidebar-text font-bold' : 'text-sidebar-text-secondary hover:bg-sidebar-hover hover:text-sidebar-text'}`}
            onClick={onClick}
        >
            <div className="flex items-center gap-3 overflow-hidden">
                <span className={color || 'text-gray-400'}>{icon}</span>
                <span className="text-sm truncate">{name}</span>
            </div>
            <div className="flex items-center gap-2">
                {count > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{count}</span>}
                {canManage && (
                    <div className="hidden group-hover:flex items-center gap-1">
                        {onEdit && <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600"><Edit3 size={12} /></button>}
                        {onDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-red-500"><Trash2 size={12} /></button>}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <aside className={`todoist-sidebar fixed left-0 top-0 h-full w-[280px] bg-sidebar-bg border-r border-sidebar-border transition-transform duration-300 z-[100] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex flex-col h-full bg-[#fcfaf8]">
                {/* User Header */}
                <div className="p-4 flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 px-2 py-1 hover:bg-sidebar-hover rounded-md transition-colors cursor-pointer flex-1">
                        <div className="w-7 h-7 bg-red-500 rounded-lg flex items-center justify-center text-white text-[10px] font-bold">АК</div>
                        <span className="text-sm font-bold text-[#202020]">Artem Kravchenko</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-1 custom-scrollbar">
                    {/* Main Filters */}
                    <div className="mb-6">
                        {filters.map(f => {
                            const now = new Date();
                            now.setHours(0, 0, 0, 0);
                            const activeTasks = tasks.filter(t => !t.completed);
                            let count = 0;

                            if (f.id === 'all') count = activeTasks.length;
                            else if (f.id === 'today') count = activeTasks.filter(t => t.dueDate && new Date(t.dueDate).setHours(0, 0, 0, 0) === now.getTime()).length;
                            else if (f.id === 'upcoming') count = activeTasks.filter(t => t.dueDate && new Date(t.dueDate).setHours(0, 0, 0, 0) > now.getTime()).length;
                            else if (f.id === 'overdue') count = activeTasks.filter(t => t.dueDate && new Date(t.dueDate).setHours(0, 0, 0, 0) < now.getTime()).length;
                            else if (f.id === 'completed') count = tasks.filter(t => t.completed).length;

                            return (
                                <SidebarItem
                                    key={f.id}
                                    {...f}
                                    isActive={currentFilter === f.id && selectedProject === 'all'}
                                    onClick={() => { setCurrentFilter(f.id); setSelectedProject('all'); }}
                                    count={count}
                                    canManage={false}
                                />
                            );
                        })}
                    </div>

                    {/* Projects Section */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between px-3 mb-1 group">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Проекти</span>
                            <button onClick={onAddProject} className="p-1 hover:bg-sidebar-hover rounded text-gray-400 hover:text-gray-600 transition-colors">
                                <Plus size={16} />
                            </button>
                        </div>
                        {projects.map(p => (
                            <SidebarItem
                                key={p.id}
                                name={p.name}
                                icon={<Circle size={10} fill={p.color} className="text-transparent" />}
                                isActive={selectedProject === p.id}
                                count={getCount(p.id)}
                                onClick={() => { setSelectedProject(p.id); setCurrentFilter('all'); }}
                                onEdit={() => onEditProject(p)}
                                onDelete={p.id !== 'inbox' ? () => onDeleteProject(p.id) : null}
                            />
                        ))}
                    </div>

                    {/* Labels Section */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between px-3 mb-1 group">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Мітки</span>
                            <button onClick={onAddLabel} className="p-1 hover:bg-sidebar-hover rounded text-gray-400 hover:text-gray-600">
                                <Plus size={16} />
                            </button>
                        </div>
                        {labels.map(l => (
                            <SidebarItem
                                key={l.id}
                                name={l.name}
                                icon={<Tag size={14} />}
                                color="text-gray-400"
                                onClick={() => { }}
                                onEdit={() => onEditLabel(l)}
                                onDelete={() => onDeleteLabel(l.id)}
                            />
                        ))}
                    </div>

                    {/* Team Section */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between px-3 mb-1 group">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Команда</span>
                            <button onClick={onAddMember} className="p-1 hover:bg-sidebar-hover rounded text-gray-400 hover:text-gray-600">
                                <Plus size={16} />
                            </button>
                        </div>
                        {teamMembers.map(m => (
                            <SidebarItem
                                key={m.id}
                                name={m.name}
                                icon={<div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[8px] font-bold">{m.avatar}</div>}
                                onClick={() => { }}
                                onEdit={() => onEditMember(m)}
                                onDelete={() => onDeleteMember(m.id)}
                            />
                        ))}
                    </div>
                </div>

                <div className="mt-auto p-4 border-t border-sidebar-border">
                    <button className="flex items-center gap-3 w-full px-3 py-2 text-sidebar-text-secondary hover:bg-sidebar-hover rounded-md text-sm transition-colors">
                        <Settings size={18} />
                        Налаштування
                    </button>
                </div>
            </div>
        </aside>
    );
};

const ProjectItem = ({ project, active, onClick, onEdit, onDelete }) => (
    <div
        className={`todoist-project-item ${active ? 'active' : ''}`}
        onClick={onClick}
    >
        <div className="project-color" style={{ backgroundColor: project.color }}></div>
        <span className="project-name">{project.name}</span>
        <span className="project-count">{project.taskCount}</span>
        <div className="project-actions">
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }}><Edit size={14} /></button>
            {project.id !== 'inbox' && (
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }}><Trash2 size={14} /></button>
            )}
        </div>
    </div>
);

export default Sidebar;
