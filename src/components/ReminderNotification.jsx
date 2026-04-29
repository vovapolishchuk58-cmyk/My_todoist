import * as ReactModule from 'react';
const React = ReactModule.default || ReactModule;
const { useEffect } = React;
import { X, MoreHorizontal, Check } from 'lucide-react';

const ReminderNotification = ({ task, onComplete, onSnooze, onClose }) => {
    // Format the time display as "Today HH:mm"
    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        return `Сегодня ${hours}:${minutes}`;
    };

    return (
        <div className="fixed bottom-6 right-6 w-[320px] bg-[#f2f2f2] border border-gray-200 rounded-[20px] p-4 shadow-2xl z-[10000] animate-in slide-in-from-bottom-6 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#e44232] rounded-[4px] flex items-center justify-center">
                        <div className="flex flex-col gap-[1.5px]">
                            <div className="w-2.5 h-[1.2px] bg-white"></div>
                            <div className="w-2.5 h-[1.2px] bg-white"></div>
                            <div className="w-2.5 h-[1.2px] bg-white"></div>
                        </div>
                    </div>
                    <span className="text-[13px] font-medium text-gray-400">Todoist</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                    <button className="hover:text-gray-600 transition-colors">
                        <MoreHorizontal size={16} />
                    </button>
                    <button onClick={onClose} className="hover:text-gray-600 transition-colors">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="mb-5 px-0.5">
                <h3 className="text-[16px] font-bold text-[#1a1a1a] mb-0.5 tracking-tight">{task.content}</h3>
                <p className="text-[14px] text-gray-500 font-medium">{formatTime(task.dueDate)}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={() => onSnooze(task.id)}
                    className="flex-1 bg-white hover:bg-gray-50 text-[#202020] font-bold py-2 rounded-[12px] transition-all text-[14px] shadow-sm active:scale-[0.97]"
                >
                    Відкласти
                </button>
                <button
                    onClick={() => onComplete(task.id)}
                    className="flex-1 bg-white hover:bg-gray-50 text-[#202020] font-bold py-2 rounded-[12px] transition-all text-[14px] shadow-sm active:scale-[0.97]"
                >
                    Complete
                </button>
            </div>
        </div>
    );
};

export default ReminderNotification;
