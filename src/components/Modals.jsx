import * as ReactModule from 'react';
const React = ReactModule.default || ReactModule;
const { useState } = React;
import { X, Check, Flag, Calendar, Trash2, Plus, MessageSquare, Paperclip, Edit, UserPlus, Tag, RefreshCcw, MoreHorizontal } from 'lucide-react';
import { SubtasksSection, CommentsSection, FilesSection } from './TaskDetail';
import CustomDatePicker from './CustomDatePicker';

const ModalOverlay = ({ children, onClose, maxWidth = '500px' }) => (
    <div className="todoist-modal-overlay" onClick={onClose}>
        <div className="todoist-modal" style={{ maxWidth }} onClick={e => e.stopPropagation()}>
            {children}
        </div>
    </div>
);

// --- Task Create/Edit Modal ---
export const TaskModal = ({ task, onSave, onClose, projects, labels, teamMembers }) => {
    const [formData, setFormData] = useState({
        content: task?.content || '',
        description: task?.description || '',
        dueDate: task?.dueDate ? (typeof task.dueDate === 'number' ? (() => {
            const d = new Date(task.dueDate);
            const offset = d.getTimezoneOffset();
            return new Date(d.getTime() - (offset * 60 * 1000)).toISOString().substring(0, 16);
        })() : task.dueDate) : '',
        priority: task?.priority || 'P4',
        labels: task?.labels || [],
        assignedTo: task?.assignedTo || '',
        project: task?.project || 'inbox',
        column: task?.column || 'todo',
        completed: task?.completed || false,
        repeat: task?.repeat || '',
        id: task?.id || Date.now().toString()
    });
    const [popover, setPopover] = useState(null);
    const titleInputRef = React.useRef(null);

    const focusTitle = () => {
        setTimeout(() => {
            if (titleInputRef.current) titleInputRef.current.focus();
        }, 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.content.trim()) {
            onSave({
                ...formData,
                dueDate: formData.dueDate || null
            });
            onClose();
        }
    };

    const priorities = [
        { value: 'P1', color: 'text-red-500' },
        { value: 'P2', color: 'text-yellow-500' },
        { value: 'P3', color: 'text-blue-500' },
        { value: 'P4', color: 'text-gray-400' }
    ];

    return (
        <ModalOverlay onClose={onClose}>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">{task ? 'Редагувати задачу' : 'Нова задача'}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-md transition-colors"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            ref={titleInputRef}
                            className="w-full text-lg font-semibold p-2 border-b border-sidebar-border focus:border-red-500 transition-colors focus:outline-none"
                            type="text"
                            placeholder="Назва задачі"
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    handleSubmit(e);
                                }
                            }}
                            autoFocus
                        />
                    </div>
                    <div>
                        <textarea
                            className="w-full p-2 border border-sidebar-border rounded-md min-h-[100px] text-sm focus:outline-none focus:border-red-500 transition-colors"
                            placeholder="Опис"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="flex flex-wrap gap-4 py-2 border-b border-gray-50">
                        {/* Date Picker Button */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setPopover(popover === 'date' ? null : 'date')}
                                className={(() => {
                                    const isOverdue = formData.dueDate && new Date(formData.dueDate) < new Date();
                                    const activeClass = isOverdue
                                        ? 'bg-orange-50 border-orange-200 text-[#ff9a14]'
                                        : 'bg-gray-50 border-gray-200 text-gray-700';
                                    return `flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${formData.dueDate ? activeClass : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`;
                                })()}
                            >
                                <Calendar size={16} />
                                <span className="text-xs font-bold">
                                    {formData.dueDate ? new Date(formData.dueDate).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' }) : 'Термін'}
                                </span>
                                {formData.repeat && <RefreshCcw size={12} className="ml-1" />}
                            </button>
                            {popover === 'date' && (
                                <div className="absolute left-0 top-full mt-2 z-[200]">
                                    <CustomDatePicker
                                        initialDate={formData.dueDate}
                                        initialRepeat={formData.repeat}
                                        onChange={(date, repeat) => {
                                            setFormData({ ...formData, dueDate: date, repeat: repeat });
                                            setPopover(null);
                                            focusTitle();
                                        }}
                                        onClear={() => {
                                            setFormData({ ...formData, dueDate: '', repeat: '' });
                                            setPopover(null);
                                            focusTitle();
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Priority Selector */}
                        <div className="flex items-center gap-2">
                            {priorities.map(p => (
                                <button
                                    key={p.value}
                                    type="button"
                                    onClick={() => { setFormData({ ...formData, priority: p.value }); focusTitle(); }}
                                    className={`p-1.5 rounded-lg border transition-all ${formData.priority === p.value ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
                                >
                                    <Flag size={18} className={p.color} fill={formData.priority === p.value ? 'currentColor' : 'none'} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <select
                            className="p-2 border border-sidebar-border rounded-md text-sm focus:outline-none"
                            value={formData.project}
                            onChange={e => { setFormData({ ...formData, project: e.target.value }); focusTitle(); }}
                        >
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <select
                            className="p-2 border border-sidebar-border rounded-md text-sm focus:outline-none"
                            value={formData.assignedTo}
                            onChange={e => { setFormData({ ...formData, assignedTo: e.target.value }); focusTitle(); }}
                        >
                            <option value="">Призначити...</option>
                            {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-sidebar-border">
                        <button type="button" onClick={onClose} className="todoist-btn-secondary todoist-btn py-2 px-4 text-sm font-medium transition-colors">Скасувати</button>
                        <button type="submit" className="todoist-btn-primary todoist-btn py-2 px-4 text-sm font-medium transition-colors">
                            {task ? 'Оновити' : 'Створити'}
                        </button>
                    </div>
                </form>
            </div>
        </ModalOverlay>
    );
};

// --- Task Detail Modal ---
export const TaskDetailModal = ({
    task, onClose, onEdit, onDelete, onToggleComplete,
    subtasks, comments, files, labels, teamMembers,
    onAddComment, onDeleteComment, onAddSubtask, onToggleSubtask, onDeleteSubtask, onAddFile, onDeleteFile
}) => {
    if (!task) return null;

    const assignedMember = teamMembers.find(m => m.id === task.assignedTo);

    return (
        <ModalOverlay onClose={onClose}>
            <div className="max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}
                            onClick={() => onToggleComplete(task.id)}
                        >
                            {task.completed && <Check size={14} className="text-white" />}
                        </div>
                        <h2 className={`text-lg font-bold truncate max-w-[300px] ${task.completed ? 'line-through text-gray-400' : 'text-[#202020]'}`}>
                            {task.content}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => onEdit(task)} className="p-2 hover:bg-gray-100 rounded-md text-gray-500"><Edit size={18} /></button>
                        <button onClick={() => onDelete(task.id)} className="p-2 hover:bg-red-50 rounded-md text-red-500"><Trash2 size={18} /></button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-md text-gray-500"><X size={18} /></button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    {task.description && (
                        <p className="text-sm text-gray-600 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-100">{task.description}</p>
                    )}

                    <div className="flex flex-wrap gap-4 mb-6">
                        {task.dueDate && (() => {
                            const isOverdue = new Date(task.dueDate) < new Date() && !task.completed;
                            const colorClass = isOverdue ? 'bg-orange-50 text-[#ff9a14] border-orange-100' : 'bg-gray-50 text-gray-600 border-gray-100';
                            return (
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
                                    <Calendar size={14} />
                                    {new Date(task.dueDate).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}
                                    {typeof task.dueDate === 'string' && task.dueDate.includes('T') && `, ${task.dueDate.split('T')[1].substring(0, 5)}`}
                                    {task.repeat && <RefreshCcw size={14} className="ml-1" />}
                                </div>
                            );
                        })()}
                        {assignedMember && (
                            <div className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium border border-gray-200">
                                <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px]">
                                    {assignedMember.avatar}
                                </div>
                                {assignedMember.name}
                            </div>
                        )}
                        {task.priority && task.priority !== 'P4' && (
                            <div className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                                <Flag size={14} className={task.priority === 'P1' ? 'text-red-500' : task.priority === 'P2' ? 'text-yellow-500' : 'text-blue-500'} />
                                {task.priority}
                            </div>
                        )}
                    </div>

                    <SubtasksSection
                        taskId={task.id} subtasks={subtasks} onAddSubtask={onAddSubtask}
                        onToggleSubtask={onToggleSubtask} onDeleteSubtask={onDeleteSubtask}
                    />

                    <CommentsSection
                        taskId={task.id} comments={comments} onAddComment={onAddComment}
                        onDeleteComment={onDeleteComment}
                    />

                    <FilesSection
                        taskId={task.id} files={files} onAddFile={onAddFile}
                        onDeleteFile={onDeleteFile}
                    />
                </div>
            </div>
        </ModalOverlay>
    );
};

// --- Project Modal ---
export const ProjectModal = ({ project, onSave, onClose }) => {
    const [name, setName] = useState(project?.name || '');
    const [color, setColor] = useState(project?.color || '#dc4c3e');

    const colors = [
        '#dc4c3e', '#ff9a14', '#fad000', '#afb83b', '#7ecc49', '#299438',
        '#6accbc', '#158fad', '#14aaf5', '#96c3eb', '#4073ff', '#884dff'
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            onSave({ id: project?.id || Date.now().toString(), name: name.trim(), color, taskCount: project?.taskCount || 0 });
            onClose();
        }
    };

    return (
        <ModalOverlay onClose={onClose}>
            <div className="p-6">
                <h2 className="text-xl font-bold mb-6">{project ? 'Редагувати проект' : 'Новий проект'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Назва проекту</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border border-sidebar-border rounded-md text-sm focus:outline-none focus:border-red-500"
                            placeholder="Назва"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Колір</label>
                        <div className="flex flex-wrap gap-2">
                            {colors.map(c => (
                                <div
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full cursor-pointer transition-all ${color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-6">
                        <button type="button" onClick={onClose} className="todoist-btn-secondary todoist-btn text-sm">Скасувати</button>
                        <button type="submit" className="todoist-btn-primary todoist-btn text-sm font-medium">Зберегти</button>
                    </div>
                </form>
            </div>
        </ModalOverlay>
    );
};

// --- Label Modal ---
export const LabelModal = ({ label, onSave, onClose }) => {
    const [name, setName] = useState(label?.name || '');
    const [color, setColor] = useState(label?.color || '#808080');

    return (
        <ModalOverlay onClose={onClose}>
            <div className="p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Tag size={20} /> {label ? 'Редагувати мітку' : 'Нова мітка'}</h2>
                <div className="space-y-4">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 border border-sidebar-border rounded-md text-sm focus:outline-none focus:border-red-500"
                        placeholder="Назва мітки"
                        autoFocus
                    />
                    <div className="flex justify-end gap-3 pt-4">
                        <button onClick={onClose} className="todoist-btn-secondary todoist-btn text-sm">Скасувати</button>
                        <button
                            onClick={() => { if (name.trim()) onSave({ id: label?.id || Date.now().toString(), name: name.trim(), color }); onClose(); }}
                            className="todoist-btn-primary todoist-btn text-sm font-medium"
                        >Зберегти</button>
                    </div>
                </div>
            </div>
        </ModalOverlay>
    );
};

// --- Team Modal ---
export const TeamModal = ({ member, onSave, onClose }) => {
    const [name, setName] = useState(member?.name || '');
    const [email, setEmail] = useState(member?.email || '');

    return (
        <ModalOverlay onClose={onClose}>
            <div className="p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><UserPlus size={20} /> {member ? 'Редагувати учасника' : 'Додати учасника'}</h2>
                <div className="space-y-4">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 border border-sidebar-border rounded-md text-sm focus:outline-none focus:border-red-500"
                        placeholder="Ім'я"
                    />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border border-sidebar-border rounded-md text-sm focus:outline-none focus:border-red-500"
                        placeholder="Email"
                    />
                    <div className="flex justify-end gap-3 pt-4">
                        <button onClick={onClose} className="todoist-btn-secondary todoist-btn text-sm">Скасувати</button>
                        <button
                            onClick={() => {
                                if (name.trim() && email.trim()) {
                                    const avatar = name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
                                    onSave({ id: member?.id || Date.now().toString(), name: name.trim(), email: email.trim(), avatar });
                                    onClose();
                                }
                            }}
                            className="todoist-btn-primary todoist-btn text-sm font-medium"
                        >Зберегти</button>
                    </div>
                </div>
            </div>
        </ModalOverlay>
    );
};
export const DeleteConfirmationModal = ({ task, onConfirm, onClose }) => {
    if (!task) return null;

    return (
        <ModalOverlay onClose={onClose} maxWidth="360px">
            <div className="p-5">
                <h2 className="text-lg font-bold mb-3">Видалити задачу?</h2>
                <p className="text-[13px] text-gray-500 mb-6 leading-relaxed">
                    Задачу <span className="font-extrabold text-[#202020]">"{task.content}"</span> буде видалено безповоротно.
                </p>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 bg-[#f5f5f5] hover:bg-[#ebebeb] text-[#202020] rounded-md text-xs font-bold transition-colors"
                    >
                        Скасувати
                    </button>
                    <button
                        onClick={() => {
                            onConfirm(task.id);
                            onClose();
                        }}
                        className="px-4 py-1.5 bg-[#de4c4a] hover:bg-[#bd3d3b] text-white rounded-md text-xs font-bold transition-colors shadow-sm"
                    >
                        Видалити
                    </button>
                </div>
            </div>
        </ModalOverlay>
    );
};
