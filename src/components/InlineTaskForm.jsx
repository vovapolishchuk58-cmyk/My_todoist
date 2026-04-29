import * as ReactModule from 'react';
const React = ReactModule.default || ReactModule;
const { useState, useEffect, useRef } = React;
import {
    X, Send, User, Flag, Calendar, Bell, Tag, Paperclip,
    MoreHorizontal, Check, MoreVertical, Hash, ChevronDown, Clock, RefreshCcw
} from 'lucide-react';
import CustomDatePicker, { RepeatOnlyView } from './CustomDatePicker';

const InlineTaskForm = ({
    initialData,
    onSave,
    onCancel,
    teamMembers = [],
    labels = [],
    columnName,
    onAddFile,
    defaultRepeatOpen = false
}) => {
    const [formData, setFormData] = useState({
        content: initialData?.content || '',
        description: initialData?.description || '',
        priority: initialData?.priority || 'P4',
        assignedTo: initialData?.assignedTo || '',
        dueDate: initialData?.dueDate ? (typeof initialData.dueDate === 'number' ? (() => {
            const d = new Date(initialData.dueDate);
            const offset = d.getTimezoneOffset();
            return new Date(d.getTime() - (offset * 60 * 1000)).toISOString().substring(0, 16);
        })() : initialData.dueDate) : '',
        labels: initialData?.labels || [],
        reminders: initialData?.reminders || false,
        repeat: initialData?.repeat || '',
        file: null,
        fileName: ''
    });
    const titleInputRef = useRef(null);

    const focusTitle = () => {
        setTimeout(() => {
            if (titleInputRef.current) {
                titleInputRef.current.focus();
                // Move cursor to the end
                const val = titleInputRef.current.value;
                titleInputRef.current.value = '';
                titleInputRef.current.value = val;
            }
        }, 0);
    };

    const [popover, setPopover] = useState(defaultRepeatOpen ? 'date' : null);
    const [repeatOpen, setRepeatOpen] = useState(defaultRepeatOpen);

    const handleSubmit = () => {
        if (!formData.content.trim()) return;
        onSave(formData);
    };

    const formatDateShort = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('uk-UA', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(',', '');
    };

    const assignedMember = teamMembers.find(m => String(m.id) === String(formData.assignedTo));
    const selectedLabels = labels.filter(l => formData.labels.includes(l.id));

    return (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xl animate-in fade-in zoom-in-95 duration-200">

            <div className="mb-4">
                <input
                    ref={titleInputRef}
                    autoFocus
                    type="text"
                    placeholder="Назва задачі"
                    className="w-full text-[14px] font-medium text-[#202020] placeholder-gray-400 focus:outline-none mb-1"
                    value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit();
                        }
                    }}
                />
                <textarea
                    placeholder="Опис"
                    className="w-full text-[13px] text-gray-600 placeholder-gray-300 focus:outline-none resize-none min-h-[30px] scrollbar-hide"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
            </div>

            <div className="flex items-center gap-2 mb-6 flex-wrap relative">
                {/* Assignee Chip */}
                <div className="relative">
                    <button
                        onClick={() => setPopover(popover === 'assignee' ? null : 'assignee')}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-all ${formData.assignedTo ? 'bg-white' : 'text-gray-400'}`}
                    >
                        {assignedMember ? (
                            <>
                                <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] overflow-hidden">
                                    {assignedMember.avatar || <User size={12} />}
                                </div>
                                <span className="text-[13px] text-gray-600">{assignedMember.name}</span>
                                <X size={14} className="ml-1 text-gray-400 hover:text-gray-600" onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, assignedTo: '' }); }} />
                            </>
                        ) : (
                            <User size={16} />
                        )}
                    </button>
                    {popover === 'assignee' && (
                        <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-100 rounded-lg shadow-xl z-[60] py-1 max-h-48 overflow-y-auto scrollbar-hide">
                            <button
                                onClick={() => { setFormData({ ...formData, assignedTo: '' }); setPopover(null); focusTitle(); }}
                                className="w-full text-left px-3 py-2 text-[12px] hover:bg-gray-50 text-gray-600 flex items-center justify-between"
                            >
                                <span>Ніхто</span>
                                {!formData.assignedTo && <Check size={12} />}
                            </button>
                            {teamMembers.map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => { setFormData({ ...formData, assignedTo: m.id }); setPopover(null); focusTitle(); }}
                                    className="w-full text-left px-3 py-2 text-[12px] hover:bg-gray-50 text-gray-600 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px]">{m.avatar}</div>
                                        <span>{m.name}</span>
                                    </div>
                                    {formData.assignedTo === m.id && <Check size={12} />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Priority Chip */}
                <div className="relative">
                    <button
                        onClick={() => setPopover(popover === 'priority' ? null : 'priority')}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-all ${formData.priority !== 'P4' ? 'bg-white' : 'text-gray-400'}`}
                    >
                        <Flag size={16} className={formData.priority === 'P1' ? 'text-red-500' : formData.priority === 'P2' ? 'text-yellow-500' : formData.priority === 'P3' ? 'text-blue-500' : 'text-gray-400'} fill={formData.priority !== 'P4' ? "currentColor" : "none"} />
                        {formData.priority !== 'P4' && (
                            <>
                                <span className="text-[13px] text-gray-600">{formData.priority}</span>
                                <X size={14} className="ml-1 text-gray-400 hover:text-gray-600" onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, priority: 'P4' }); }} />
                            </>
                        )}
                    </button>
                    {popover === 'priority' && (
                        <div className="absolute left-0 mt-1 w-32 bg-white border border-gray-100 rounded-lg shadow-xl z-[60] py-1">
                            {[
                                { v: 'P1', c: 'text-red-500', n: 'Пріоритет 1' },
                                { v: 'P2', c: 'text-yellow-500', n: 'Пріоритет 2' },
                                { v: 'P3', c: 'text-blue-500', n: 'Пріоритет 3' },
                                { v: 'P4', c: 'text-gray-400', n: 'Пріоритет 4' }
                            ].map(p => (
                                <button
                                    key={p.v}
                                    onClick={() => { setFormData({ ...formData, priority: p.v }); setPopover(null); focusTitle(); }}
                                    className={`w-full text-left px-3 py-2 text-[12px] hover:bg-gray-50 flex items-center justify-between ${p.c}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Flag size={12} fill={p.v !== 'P4' ? "currentColor" : "none"} />
                                        <span>{p.n}</span>
                                    </div>
                                    {formData.priority === p.v && <Check size={12} />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Date Chip */}
                <div className="relative">
                    <button
                        onClick={() => {
                            setRepeatOpen(false);
                            setPopover(popover === 'date' ? null : 'date');
                        }}
                        className={(() => {
                            const isOverdue = formData.dueDate && new Date(formData.dueDate) < new Date();
                            const activeClass = isOverdue
                                ? 'bg-orange-50 border-orange-200 text-[#ff9a14]'
                                : 'bg-white border-gray-100 text-gray-600';
                            return `flex items-center gap-2 px-2 py-1.5 rounded-lg border transition-all ${formData.dueDate ? activeClass : 'border-gray-100 text-gray-400 hover:bg-gray-50'}`;
                        })()}
                    >
                        <Calendar size={16} />
                        {formData.dueDate && (
                            <>
                                <span className="text-[13px] text-gray-600">{formatDateShort(formData.dueDate)}</span>
                                {formData.repeat && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setRepeatOpen(true);
                                            setPopover('date');
                                        }}
                                        className="p-1 hover:bg-gray-100 rounded transition-colors ml-0.5 group/repeat"
                                        title={formData.repeat}
                                    >
                                        <RefreshCcw size={13} className="text-gray-400 group-hover/repeat:text-gray-600" />
                                    </button>
                                )}
                                <X size={14} className="ml-1 text-gray-400 hover:text-gray-600" onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, dueDate: '', repeat: '' }); focusTitle(); }} />
                            </>
                        )}
                    </button>
                    {popover === 'date' && (
                        <div className="absolute left-0 mt-1 z-[60]">
                            {repeatOpen ? (
                                <RepeatOnlyView
                                    initialRepeat={formData.repeat}
                                    onChange={(repeatVal) => {
                                        setFormData({ ...formData, repeat: repeatVal });
                                        setPopover(null);
                                        setRepeatOpen(false);
                                    }}
                                    onClose={() => {
                                        setPopover(null);
                                        setRepeatOpen(false);
                                        focusTitle();
                                    }}
                                />
                            ) : (
                                <CustomDatePicker
                                    initialDate={formData.dueDate}
                                    initialRepeat={formData.repeat}
                                    defaultRepeatOpen={false}
                                    onChange={(dateStr, repeatVal) => {
                                        setFormData({ ...formData, dueDate: dateStr, repeat: repeatVal });
                                        setPopover(null);
                                        setRepeatOpen(false);
                                        focusTitle();
                                    }}
                                    onClear={() => {
                                        setFormData({ ...formData, dueDate: '', repeat: '' });
                                        setPopover(null);
                                        setRepeatOpen(false);
                                        focusTitle();
                                    }}
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* Time / Reminders Chip */}
                <div className="relative">
                    <button
                        onClick={() => setPopover(popover === 'reminders' ? null : 'reminders')}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-all ${formData.reminders ? 'bg-white' : 'text-gray-400'}`}
                    >
                        <Clock size={16} />
                        <span className="text-[13px] text-gray-600">Время задачи</span>
                    </button>
                    {popover === 'reminders' && (
                        <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-100 rounded-lg shadow-xl z-[60] p-3 text-center">
                            <p className="text-[11px] text-gray-400 mb-2">Нагадування вимкнено</p>
                            <button
                                onClick={() => { setFormData({ ...formData, reminders: !formData.reminders }); setPopover(null); focusTitle(); }}
                                className="w-full bg-gray-50 hover:bg-gray-100 py-1.5 rounded-md text-[12px] font-bold text-gray-600 transition-colors"
                            >
                                {formData.reminders ? 'Вимкнути' : 'Увімкнути'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Labels Chip */}
                <div className="relative">
                    <button
                        onClick={() => setPopover(popover === 'labels' ? null : 'labels')}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-all ${formData.labels?.length > 0 ? 'bg-white' : 'text-gray-400'}`}
                    >
                        <Tag size={16} className={formData.labels?.length > 0 ? 'text-teal-600' : ''} fill={formData.labels?.length > 0 ? 'currentColor' : 'none'} />
                        {selectedLabels.length > 0 && (
                            <>
                                <span className="text-[13px] text-gray-600">{selectedLabels[0].name}</span>
                                <X size={14} className="ml-1 text-gray-400 hover:text-gray-600" onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, labels: [] }); }} />
                            </>
                        )}
                    </button>
                    {popover === 'labels' && (
                        <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-100 rounded-lg shadow-xl z-[60] py-1 max-h-48 overflow-y-auto scrollbar-hide">
                            {labels && labels.length > 0 ? labels.map(label => (
                                <button
                                    key={label.id}
                                    onClick={() => {
                                        const exists = formData.labels.includes(label.id);
                                        const newLabels = exists
                                            ? formData.labels.filter(id => id !== label.id)
                                            : [...formData.labels, label.id];
                                        setFormData({ ...formData, labels: newLabels });
                                        focusTitle();
                                    }}
                                    className="w-full text-left px-3 py-2 text-[12px] hover:bg-gray-50 text-gray-600 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: label.color }}></div>
                                        <span>{label.name}</span>
                                    </div>
                                    {formData.labels.includes(label.id) && <Check size={12} className="text-[#de4c4a]" />}
                                </button>
                            )) : <div className="p-3 text-[11px] text-gray-400 italic">Немає міток</div>}
                        </div>
                    )}
                </div>

                <button className="flex items-center justify-center p-2 rounded-lg border border-gray-100 text-gray-400 hover:bg-gray-50 transition-all">
                    <MoreHorizontal size={16} />
                </button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors group">
                    <Hash size={16} className="text-blue-600" />
                    <div className="flex items-center gap-1.5 text-[14px] font-medium text-gray-600">
                        <span className="truncate max-w-[80px]">Вхідні</span>
                        <span className="text-gray-300">/</span>
                        <span className="truncate max-w-[80px]">{columnName || 'Без розділу'}</span>
                    </div>
                    <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600" />
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onCancel}
                        className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <button
                        disabled={!formData.content.trim()}
                        onClick={handleSubmit}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${formData.content.trim() ? 'bg-[#c3392c] text-white shadow-md hover:bg-[#a63025]' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
                    >
                        <Send size={18} fill="white" className="rotate-0" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InlineTaskForm;
