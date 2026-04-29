import * as ReactModule from 'react';
const React = ReactModule.default || ReactModule;
const { useState, useRef } = React;
import { Plus, Trash2, CheckCircle2, Circle, MessageSquare, Paperclip, File, FileText, FileImage, Archive } from 'lucide-react';

// --- Subtasks Section ---
export const SubtasksSection = ({ taskId, subtasks = [], onAddSubtask, onToggleSubtask, onDeleteSubtask }) => {
    const [newSubtask, setNewSubtask] = useState('');
    const [showForm, setShowForm] = useState(false);

    const taskSubtasks = (subtasks || []).filter(s => String(s.parentId) === String(taskId));
    const completedCount = taskSubtasks.filter(s => s.completed).length;
    const progress = taskSubtasks.length > 0 ? (completedCount / taskSubtasks.length) * 100 : 0;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newSubtask.trim()) {
            onAddSubtask(taskId, newSubtask.trim());
            setNewSubtask('');
            setShowForm(false);
        }
    };

    return (
        <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-sm text-[#202020]">Підзадачі ({completedCount}/{taskSubtasks.length})</h4>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <Plus size={18} />
                </button>
            </div>

            {taskSubtasks.length > 0 && (
                <div className="h-1.5 w-full bg-gray-100 rounded-full mb-4 overflow-hidden">
                    <div
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-4">
                    <input
                        type="text"
                        value={newSubtask}
                        onChange={(e) => setNewSubtask(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-red-500"
                        placeholder="Нова підзадача..."
                        autoFocus
                    />
                    <div className="flex gap-2 mt-2">
                        <button type="submit" className="todoist-btn-primary todoist-btn text-xs py-1 px-3">Додати</button>
                        <button type="button" onClick={() => setShowForm(false)} className="todoist-btn-secondary todoist-btn text-xs py-1 px-3">Скасувати</button>
                    </div>
                </form>
            )}

            <div className="space-y-2">
                {taskSubtasks.map(subtask => (
                    <div key={subtask.id} className="group flex items-center gap-3 py-2 hover:bg-gray-50 rounded px-2">
                        <button
                            onClick={() => onToggleSubtask(subtask.id)}
                            className={`flex-shrink-0 transition-colors ${subtask.completed ? 'text-green-500' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {subtask.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                        </button>
                        <span className={`text-sm flex-1 ${subtask.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                            {subtask.content}
                        </span>
                        <button
                            onClick={() => onDeleteSubtask(subtask.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Comments Section ---
export const CommentsSection = ({ taskId, comments = [], onAddComment, onDeleteComment }) => {
    const [newComment, setNewComment] = useState('');
    const [showForm, setShowForm] = useState(false);

    const taskComments = (comments || []).filter(c => String(c.taskId) === String(taskId));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newComment.trim()) {
            onAddComment(taskId, newComment.trim());
            setNewComment('');
            setShowForm(false);
        }
    };

    return (
        <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-sm text-[#202020] flex items-center gap-2">
                    <MessageSquare size={16} /> Коментарі ({taskComments.length})
                </h4>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <Plus size={18} />
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-4">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-red-500 min-h-[80px]"
                        placeholder="Додати коментар..."
                        autoFocus
                    />
                    <div className="flex gap-2 mt-2">
                        <button type="submit" className="todoist-btn-primary todoist-btn text-xs py-1 px-3">Додати</button>
                        <button type="button" onClick={() => setShowForm(false)} className="todoist-btn-secondary todoist-btn text-xs py-1 px-3">Скасувати</button>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {taskComments.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            U
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-lg p-3 relative group">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-semibold text-gray-700">Користувач</span>
                                <span className="text-[10px] text-gray-400">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{comment.content}</p>
                            <button
                                onClick={() => onDeleteComment(comment.id)}
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Files Section ---
export const FilesSection = ({ taskId, files = [], onAddFile, onDeleteFile }) => {
    const [showForm, setShowForm] = useState(false);
    const fileInputRef = useRef(null);

    const taskFiles = (files || []).filter(f => String(f.taskId) === String(taskId));

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            onAddFile(taskId, {
                id: Date.now().toString(),
                name: file.name,
                size: file.size,
                type: file.type
            });
            setShowForm(false);
        }
    };

    const getFileIcon = (fileName) => {
        const ext = fileName.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return <FileImage className="text-pink-500" size={18} />;
        if (['pdf', 'doc', 'docx'].includes(ext)) return <FileText className="text-blue-500" size={18} />;
        if (['zip', 'rar'].includes(ext)) return <Archive className="text-amber-500" size={18} />;
        return <File className="text-gray-500" size={18} />;
    };

    return (
        <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-sm text-[#202020] flex items-center gap-2">
                    <Paperclip size={16} /> Файли ({taskFiles.length})
                </h4>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <Plus size={18} />
                </button>
            </div>

            {showForm && (
                <div className="mb-4">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-gray-400 hover:border-red-300 hover:text-red-400 cursor-pointer transition-all"
                    >
                        <Paperclip size={24} className="mb-2" />
                        <span className="text-xs font-medium">Вибрати файл...</span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {taskFiles.map(file => (
                    <div key={file.id} className="group flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all relative">
                        {getFileIcon(file.name)}
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-gray-700 truncate">{file.name}</div>
                            <div className="text-[10px] text-gray-400">{Math.round(file.size / 1024)} KB</div>
                        </div>
                        <button
                            onClick={() => onDeleteFile(file.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all ml-2"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
