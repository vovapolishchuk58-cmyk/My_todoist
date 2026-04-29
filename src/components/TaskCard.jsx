import * as ReactModule from 'react';
const React = ReactModule.default || ReactModule;
import {
    Calendar,
    Flag,
    Check,
    MessageSquare,
    Paperclip,
    CheckSquare,
    Edit3,
    Trash2,
    RefreshCcw
} from 'lucide-react';
import { RepeatOnlyView } from './CustomDatePicker';

const TaskCard = ({
    task,
    onToggleComplete,
    onTaskDelete,
    onShowDetails,
    onRepeatClick,
    onUpdateRepeat,
    subtasks = [],
    comments = [],
    files = [],
    labels = [],
    teamMembers = []
}) => {
    const [isRepeatOpen, setIsRepeatOpen] = React.useState(false);
    const taskLabels = (labels || []).filter(l =>
        task.labels?.map(String).includes(String(l.id))
    );
    const assignedMember = (teamMembers || []).find(m => String(m.id) === String(task.assignedTo));
    const taskSubtasks = (subtasks || []).filter(s => String(s.parentId) === String(task.id));
    const taskComments = (comments || []).filter(c => String(c.taskId) === String(task.id));
    const taskFiles = (files || []).filter(f => String(f.taskId) === String(task.id));
    const completedSubtasks = taskSubtasks.filter(s => s.completed).length;

    const formatDate = (timestamp) => {
        if (!timestamp) return null;
        const date = new Date(timestamp);
        let formatted = date.toLocaleDateString('uk-UA', {
            day: 'numeric',
            month: 'short'
        });

        if (typeof timestamp === 'string' && timestamp.includes('T')) {
            const timePart = timestamp.split('T')[1];
            if (timePart) {
                formatted += `, ${timePart.substring(0, 5)}`;
            }
        }
        return formatted;
    };

    return (
        <div
            className={`group relative bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all cursor-pointer mb-3 select-none min-h-[100px] ${task.completed ? 'opacity-60' : ''}`}
            onClick={() => onShowDetails(task)}
        >
            {/* Priority Side Marker */}
            {task.priority && task.priority !== 'P4' && (
                <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${task.priority === 'P1' ? 'bg-red-500' :
                    task.priority === 'P2' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
            )}

            <div className="flex items-start gap-3 pl-1">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleComplete(task.id);
                    }}
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shadow-sm ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-sidebar-text'
                        }`}
                >
                    {task.completed && <Check size={12} className="text-white" strokeWidth={3} />}
                </button>

                <div className="flex-1 min-w-0 pr-1">
                    <h3 className={`text-sm font-semibold mb-1 truncate ${task.completed ? 'line-through text-gray-400 font-normal' : 'text-[#202020]'}`}>
                        {task.content}
                    </h3>

                    {task.description && (
                        <p className="text-xs text-sidebar-text-secondary line-clamp-2 mb-2 leading-relaxed">
                            {task.description}
                        </p>
                    )}

                    <div className="flex items-end justify-between mt-1 gap-2">
                        <div className="flex flex-col gap-2 min-w-0">
                            <div className="flex flex-wrap items-center gap-3">
                                {task.dueDate && (() => {
                                    const isOverdue = new Date(task.dueDate) < new Date() && !task.completed;
                                    return (
                                        <div className={`flex items-center gap-1 text-[10px] font-bold whitespace-nowrap ${isOverdue ? 'text-[#d1473d]' : 'text-gray-500'}`}>
                                            <Calendar size={12} />
                                            <span>{formatDate(task.dueDate)}</span>
                                            {task.repeat && (
                                                <div className="inline-block relative">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setIsRepeatOpen(!isRepeatOpen);
                                                        }}
                                                        className={`p-1 hover:bg-gray-100 rounded transition-colors group/repeat ${isRepeatOpen ? 'bg-gray-100' : ''}`}
                                                        title={task.repeat}
                                                    >
                                                        <RefreshCcw size={10} className="text-gray-400 group-hover/repeat:text-gray-600" />
                                                    </button>
                                                    {isRepeatOpen && (
                                                        <div className="absolute top-full left-0 mt-1 z-[200] whitespace-normal">
                                                            <RepeatOnlyView
                                                                initialRepeat={task.repeat}
                                                                onChange={(val) => {
                                                                    if (onUpdateRepeat) onUpdateRepeat(task.id, val);
                                                                    setIsRepeatOpen(false);
                                                                }}
                                                                onClose={() => setIsRepeatOpen(false)}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}

                                <div className="flex items-center gap-2">
                                    {taskLabels.map(label => (
                                        <span
                                            key={label.id}
                                            className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white shadow-sm"
                                            style={{ backgroundColor: label.color }}
                                        >
                                            {label.name}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Stats Icons */}
                            {(taskSubtasks.length > 0 || taskComments.length > 0 || taskFiles.length > 0) && (
                                <div className="flex items-center gap-3 ml-[-2px]">
                                    {taskSubtasks.length > 0 && (
                                        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                            <CheckSquare size={12} />
                                            {completedSubtasks}/{taskSubtasks.length}
                                        </div>
                                    )}
                                    {taskComments.length > 0 && (
                                        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                            <MessageSquare size={12} />
                                            {taskComments.length}
                                        </div>
                                    )}
                                    {taskFiles.length > 0 && (
                                        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                            <Paperclip size={12} />
                                            {taskFiles.length}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {assignedMember && (
                    <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full border border-gray-100 bg-blue-500 text-white flex items-center justify-center text-[8px] font-black shadow-lg">
                        {assignedMember.avatar}
                    </div>
                )}

                <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onTaskDelete) {
                                onTaskDelete(task.id);
                            }
                        }}
                        className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-colors"
                        title="Видалити"
                    >
                        <Trash2 size={14} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onShowDetails(task); // Edit usually triggers details or a dedicated modal
                        }}
                        className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors"
                        title="Редагувати"
                    >
                        <Edit3 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
