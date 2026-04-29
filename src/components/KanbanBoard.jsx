import * as ReactModule from 'react';
const React = ReactModule.default || ReactModule;
const { useEffect, useRef, useState } = React;
import Sortable from 'sortablejs';
import TaskCard from './TaskCard';
import InlineTaskForm from './InlineTaskForm';
import { Plus, Trash2, GripVertical, X, LayoutGrid, MoreHorizontal, Edit, ArrowRight, Copy, Link, Archive, User, Calendar, Flag, Bell, Tag, Paperclip, Send, Check } from 'lucide-react';

const KanbanBoard = ({
    tasks = [],
    columns = [],
    onTaskMove,
    onTaskClick,
    onToggleComplete,
    onAddColumn,
    onUpdateColumn,
    onDeleteColumn,
    onMoveColumn,
    onSaveTask,
    onTaskDelete,
    onAddFile,
    subtasks = [],
    comments = [],
    files = [],
    labels = [],
    teamMembers = []
}) => {
    const boardRef = useRef(null);
    const columnRefs = useRef({});
    const onTaskMoveRef = useRef(onTaskMove);
    const onMoveColumnRef = useRef(onMoveColumn);

    const [isAdding, setIsAdding] = useState(false);
    const [newColName, setNewColName] = useState('');
    const [activeMenu, setActiveMenu] = useState(null); // Track which column menu is open
    const [editingColumn, setEditingColumn] = useState(null); // Track which column is being renamed
    const [editName, setEditName] = useState('');

    // Inline Task Addition state
    const [addingTaskToCol, setAddingTaskToCol] = useState(null);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editingWithRepeat, setEditingWithRepeat] = useState(false);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (activeMenu && !e.target.closest('.column-menu-container')) {
                setActiveMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeMenu]);

    useEffect(() => {
        onTaskMoveRef.current = onTaskMove;
        onMoveColumnRef.current = onMoveColumn;
    }, [onTaskMove, onMoveColumn]);

    useEffect(() => {
        const instances = [];

        // 1. Board Sortable (Columns Reordering)
        if (boardRef.current && Sortable) {
            const boardSortable = Sortable.create(boardRef.current, {
                animation: 150,
                handle: '.kanban-column-header',
                filter: 'button, input, .column-menu-container, textarea',
                preventOnFilter: false,
                draggable: '.todoist-kanban-column',
                onEnd: (evt) => {
                    const { oldIndex, newIndex, from, item } = evt;
                    // Revert DOM for React
                    if (oldIndex !== newIndex) {
                        try {
                            from.insertBefore(item, from.children[oldIndex] || null);
                        } catch (e) { }
                        if (onMoveColumnRef.current) {
                            onMoveColumnRef.current(oldIndex, newIndex);
                        }
                    }
                }
            });
            instances.push(boardSortable);
        }

        // 2. Task List Sortables
        columns.forEach(column => {
            const el = columnRefs.current[column.id];
            if (el && Sortable) {
                const sortable = Sortable.create(el, {
                    group: 'tasks',
                    animation: 150,
                    ghostClass: 'opacity-40',
                    draggable: '[data-id]',
                    onEnd: (evt) => {
                        const { from, to, item, oldIndex } = evt;
                        try {
                            from.insertBefore(item, from.children[oldIndex] || null);
                        } catch (e) { }

                        const taskId = item.getAttribute('data-id');
                        const newColumnId = to.getAttribute('data-col');
                        if (taskId && newColumnId && onTaskMoveRef.current) {
                            onTaskMoveRef.current(taskId, newColumnId);
                        }
                    }
                });
                instances.push(sortable);
            }
        });

        return () => {
            instances.forEach(ins => ins.destroy());
        };
    }, [columns]); // Re-init when columns change to bind new lists

    const handleAddSubmit = (e) => {
        e.preventDefault();
        if (newColName.trim()) {
            onAddColumn(newColName.trim());
            setNewColName('');
            setIsAdding(false);
        }
    };

    return (
        <div
            ref={boardRef}
            className="todoist-kanban flex gap-6 p-6 min-h-full items-start overflow-x-auto scrollbar-hide"
        >
            {columns.map(column => {
                const columnTasks = (tasks || []).filter(t => t && t.column === column.id);

                return (
                    <div
                        key={column.id}
                        className="todoist-kanban-column flex-1 min-w-[320px] max-w-[320px] flex flex-col bg-white rounded-2xl p-4 border border-gray-100 shadow-sm transition-all hover:shadow-md"
                    >
                        {/* Column Header */}
                        <div className="flex items-center justify-between mb-4 group/header kanban-column-header cursor-grab active:cursor-grabbing select-none">
                            <div className="flex items-baseline gap-1.5 flex-1 min-w-0">
                                <h3 className="text-[14px] font-extrabold text-[#202020] truncate">
                                    {column.name}
                                </h3>
                                <span className="text-[12px] text-gray-400 font-medium shrink-0">
                                    {(columnTasks || []).length}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="relative column-menu-container">
                                    <button
                                        onClick={() => setActiveMenu(activeMenu === column.id ? null : column.id)}
                                        title="Інші дії"
                                        className={`p-1 hover:bg-gray-100 rounded text-gray-400 transition-colors ${activeMenu === column.id ? 'bg-gray-100 text-gray-600' : ''}`}
                                    >
                                        <MoreHorizontal size={16} className="text-gray-300 hover:text-gray-500" />
                                    </button>

                                    {activeMenu === column.id && (
                                        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-100 rounded-lg shadow-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in duration-150">
                                            <button
                                                onClick={() => {
                                                    setEditingColumn(column.id);
                                                    setEditName(column.name);
                                                    setActiveMenu(null);
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors"
                                            >
                                                <Edit size={14} /> <span>Змінити</span>
                                            </button>
                                            <button className="w-full flex items-center gap-3 px-3 py-2 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors">
                                                <ArrowRight size={14} /> <span>Перенести в...</span>
                                            </button>
                                            <button className="w-full flex items-center gap-3 px-3 py-2 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors">
                                                <Copy size={14} /> <span>Дублювати</span>
                                            </button>
                                            <button className="w-full flex items-center gap-3 px-3 py-2 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors border-b border-gray-50 pb-2">
                                                <Link size={14} /> <span>Скопіювати посилання</span>
                                            </button>

                                            <div className="pt-1">
                                                <button className="w-full flex items-center gap-3 px-3 py-2 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors">
                                                    <Archive size={14} /> <span>Архівувати</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        onDeleteColumn(column.id);
                                                        setActiveMenu(null);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-3 py-2 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
                                                >
                                                    <Trash2 size={14} /> <span>Видалити</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Inline renaming UI */}
                        {editingColumn === column.id && (
                            <div className="mb-4 animate-in slide-in-from-top-1 duration-200">
                                <input
                                    autoFocus
                                    className="w-full p-2 text-sm border-2 border-[#de4c4a] rounded-lg focus:outline-none font-bold"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            if (editName.trim() && onUpdateColumn) {
                                                onUpdateColumn(column.id, editName.trim());
                                            }
                                            setEditingColumn(null);
                                        }
                                        if (e.key === 'Escape') setEditingColumn(null);
                                    }}
                                />
                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={() => {
                                            if (editName.trim() && onUpdateColumn) {
                                                onUpdateColumn(column.id, editName.trim());
                                            }
                                            setEditingColumn(null);
                                        }}
                                        className="bg-[#de4c4a] text-white text-[11px] px-3 py-1 rounded-md font-bold"
                                    >Зберегти</button>
                                    <button
                                        onClick={() => setEditingColumn(null)}
                                        className="bg-gray-100 text-gray-600 text-[11px] px-3 py-1 rounded-md font-bold"
                                    >Скасувати</button>
                                </div>
                            </div>
                        )}

                        {/* Task List */}
                        <div
                            ref={el => columnRefs.current[column.id] = el}
                            data-col={column.id}
                            className="todoist-task-list min-h-[30px] flex-1 mb-4"
                        >
                            {columnTasks.length === 0 && addingTaskToCol !== column.id && (
                                <div className="flex flex-col items-center justify-center pt-1 pb-2 px-2 text-center cursor-default empty-column-placeholder">
                                    <svg width="36" height="36" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-1.5">
                                        <path d="M18 20L23 25L32 15" stroke="#C4C8D0" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M18 36L23 41L32 31" stroke="#C4C8D0" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                        <circle cx="20.5" cy="51" r="4" fill="#C4C8D0" />
                                        <line x1="38" y1="20" x2="52" y2="20" stroke="#C4C8D0" strokeWidth="4" strokeLinecap="round" />
                                        <line x1="38" y1="36" x2="52" y2="36" stroke="#C4C8D0" strokeWidth="4" strokeLinecap="round" />
                                        <line x1="32" y1="51" x2="52" y2="51" stroke="#C4C8D0" strokeWidth="4" strokeLinecap="round" />
                                    </svg>
                                    <h4 className="text-[15px] font-medium text-[#6b7280] mb-1">Немає задач</h4>
                                    <p className="text-[12px] text-[#6b7280] leading-[1.3] font-normal max-w-[200px]">Створіть нову задачу або<br />перемістіть існуючу сюди</p>
                                </div>
                            )}
                            {columnTasks.map(task => (
                                <div key={task.id} data-id={task.id} className="group/card relative">
                                    {editingTaskId === task.id ? (
                                        <div className="mb-3">
                                            <InlineTaskForm
                                                initialData={task}
                                                columnName={column.name}
                                                teamMembers={teamMembers}
                                                labels={labels}
                                                onCancel={() => {
                                                    setEditingTaskId(null);
                                                    setEditingWithRepeat(false);
                                                }}
                                                defaultRepeatOpen={editingWithRepeat}
                                                onSave={(updatedData) => {
                                                    if (onSaveTask) {
                                                        onSaveTask({
                                                            ...task,
                                                            ...updatedData,
                                                            dueDate: updatedData.dueDate || null,
                                                        });
                                                    }
                                                    setEditingTaskId(null);
                                                }}
                                                onAddFile={onAddFile}
                                            />
                                        </div>
                                    ) : (
                                        <TaskCard
                                            task={task}
                                            onToggleComplete={onToggleComplete}
                                            onTaskDelete={onTaskDelete}
                                            onShowDetails={(t) => {
                                                setEditingTaskId(t.id);
                                                setEditingWithRepeat(false);
                                            }}
                                            onUpdateRepeat={(taskId, newRepeat) => {
                                                const taskToUpdate = tasks.find(t => t.id === taskId);
                                                if (taskToUpdate && onSaveTask) {
                                                    onSaveTask({ ...taskToUpdate, repeat: newRepeat });
                                                }
                                            }}
                                            subtasks={subtasks}
                                            comments={comments}
                                            files={files}
                                            labels={labels}
                                            teamMembers={teamMembers}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Add Task Logic */}
                        {addingTaskToCol === column.id ? (
                            <div className="mb-4">
                                <InlineTaskForm
                                    columnName={column.name}
                                    teamMembers={teamMembers}
                                    labels={labels}
                                    onCancel={() => setAddingTaskToCol(null)}
                                    onSave={(taskData) => {
                                        if (onSaveTask) {
                                            const taskId = Date.now().toString();
                                            onSaveTask({
                                                id: taskId,
                                                ...taskData,
                                                dueDate: taskData.dueDate || null,
                                                column: column.id,
                                                completed: false,
                                                project: 'inbox'
                                            });

                                            if (taskData.file && onAddFile) {
                                                onAddFile(taskId, {
                                                    id: `file-${Date.now()}`,
                                                    name: taskData.file.name,
                                                    size: taskData.file.size,
                                                    type: taskData.file.type,
                                                    url: URL.createObjectURL(taskData.file)
                                                });
                                            }
                                        }
                                        setAddingTaskToCol(null);
                                    }}
                                    onAddFile={onAddFile}
                                />
                            </div>
                        ) : (
                            <button
                                onClick={() => setAddingTaskToCol(column.id)}
                                className="flex items-center gap-2 group/add-task text-gray-400 hover:text-[#de4c4a] transition-all py-1.5"
                            >
                                <div className="flex items-center justify-center w-6 h-6 rounded-full group-hover/add-task:bg-[#de4c4a] transition-all">
                                    <Plus
                                        size={14}
                                        className="text-[#de4c4a] group-hover/add-task:text-white transition-colors"
                                        strokeWidth={3}
                                    />
                                </div>
                                <span className="text-[13px] font-medium transition-colors">Додати задачу</span>
                            </button>
                        )}
                    </div>
                );
            })}

            {/* Add Section Button (Compact Screenshot Style) */}
            <div className="min-w-[320px]">
                {isAdding ? (
                    <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-lg">
                        <input
                            autoFocus
                            type="text"
                            placeholder="Назва розділу"
                            className="w-full p-2 text-[13px] border border-[#de4c4a] rounded-lg mb-3 focus:outline-none placeholder-gray-400 font-medium text-gray-800"
                            value={newColName}
                            onChange={(e) => setNewColName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddSubmit(e);
                                if (e.key === 'Escape') setIsAdding(false);
                            }}
                        />
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleAddSubmit}
                                className="bg-[#de4c4a] hover:bg-[#b03d3a] text-white text-[13px] py-2 px-4 font-bold rounded-lg transition-colors shadow-sm"
                            >
                                Додати
                            </button>
                            <button
                                onClick={() => setIsAdding(false)}
                                className="bg-[#e5e7eb] hover:bg-[#d1d5db] text-[#374151] text-[13px] py-2 px-4 font-bold rounded-lg transition-colors shadow-sm"
                            >
                                Скасувати
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:text-[#de4c4a] transition-all rounded-2xl border border-transparent hover:bg-gray-50/50 group/btn"
                    >
                        <div className="relative flex flex-col items-center justify-center scale-75 origin-left">
                            <div className="w-6 h-[1px] bg-gray-300 group-hover/btn:bg-[#de4c4a] transition-colors mb-[1.8px]"></div>
                            <div className="w-7 h-5 border border-gray-300 rounded-[4px] flex items-center justify-center group-hover/btn:bg-[#de4c4a] group-hover/btn:border-[#de4c4a] transition-all">
                                <Plus size={10} className="text-gray-400 group-hover/btn:text-white" strokeWidth={6} />
                            </div>
                            <div className="w-6 h-[1px] bg-gray-300 group-hover/btn:bg-[#de4c4a] transition-colors mt-[1.8px]"></div>
                        </div>
                        <span className="text-[13px] font-bold tracking-tight">Додати розділ</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default KanbanBoard;
