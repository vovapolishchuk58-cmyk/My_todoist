import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, RefreshCcw, X } from 'lucide-react';

const CustomDatePicker = ({ initialDate, initialRepeat, defaultRepeatOpen, onChange, onClear }) => {
    // initialDate might be a YYYY-MM-DD string or a string timestamp
    const [viewDate, setViewDate] = useState(initialDate ? new Date(initialDate) : new Date());
    const [selectedDate, setSelectedDate] = useState(initialDate ? new Date(initialDate) : null);

    const [time, setTime] = useState(() => {
        if (initialDate && initialDate.includes('T')) {
            const t = initialDate.split('T')[1];
            if (t) return t.substring(0, 5);
        }
        return '';
    });

    const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
    const [isRepeatDropdownOpen, setIsRepeatDropdownOpen] = useState(defaultRepeatOpen || false);
    const [repeat, setRepeat] = useState(initialRepeat || '');

    useEffect(() => {
        if (initialDate) {
            const d = new Date(initialDate);
            setViewDate(d);
            setSelectedDate(d);
            if (initialDate.includes('T')) {
                const t = initialDate.split('T')[1];
                if (t) setTime(t.substring(0, 5));
            } else {
                setTime('');
            }
        } else {
            setViewDate(new Date());
            setSelectedDate(null);
            setTime('');
        }
    }, [initialDate]);

    useEffect(() => {
        setRepeat(initialRepeat || '');
    }, [initialRepeat]);

    const months = [
        "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
        "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"
    ];

    const weekDays = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "НД"];

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => {
        let day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1;
    };

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleToday = () => {
        setViewDate(new Date());
    };

    const handleDateClick = (day) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        setSelectedDate(newDate);

        // Notify parent
        const offset = newDate.getTimezoneOffset();
        const localDate = new Date(newDate.getTime() - (offset * 60 * 1000));
        let dateStr = localDate.toISOString().split('T')[0];
        if (time) {
            dateStr += `T${time}:00`;
        }
        onChange(dateStr, repeat);
    };

    const handleSaveTime = (newTime, newRepeat) => {
        const timeToUse = newTime !== undefined ? newTime : time;
        const repeatToUse = newRepeat !== undefined ? newRepeat : repeat;

        let baseDateStr = selectedDate ? selectedDate : new Date();
        const offset = baseDateStr.getTimezoneOffset();
        const localDate = new Date(baseDateStr.getTime() - (offset * 60 * 1000));
        let dateStr = localDate.toISOString().split('T')[0];

        if (timeToUse) {
            dateStr += `T${timeToUse}:00`;
        }
        onChange(dateStr, repeatToUse);
    };

    const generateTimeOptions = () => {
        const options = [];
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 15) {
                const hour = h.toString().padStart(2, '0');
                const minute = m.toString().padStart(2, '0');
                options.push(`${hour}:${minute}`);
            }
        }
        return options;
    };

    const renderCalendar = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const today = new Date();

        const blanks = Array(firstDay).fill(null);
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        const totalSlots = [...blanks, ...days];

        const weeks = [];
        let currentWeek = [];

        totalSlots.forEach((slot, i) => {
            currentWeek.push(slot);
            if ((i + 1) % 7 === 0 || i === totalSlots.length - 1) {
                while (currentWeek.length < 7 && i === totalSlots.length - 1) {
                    currentWeek.push(null);
                }
                weeks.push(currentWeek);
                currentWeek = [];
            }
        });

        return (
            <div className="w-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-[14px] font-bold text-[#202020]">
                        {months[month]} {year}
                    </span>
                    <div className="flex items-center gap-1.5">
                        <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded text-gray-400">
                            <ChevronLeft size={14} />
                        </button>
                        <button type="button" onClick={handleToday} className="p-1 hover:bg-gray-100 rounded text-gray-300" title="Сьогодні">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                            </svg>
                        </button>
                        <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded text-gray-400">
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>

                {/* Weekdays */}
                <div className="grid grid-cols-7 mb-1">
                    {weekDays.map(day => (
                        <div key={day} className="text-center text-[10px] font-medium text-gray-400">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7">
                    {weeks.map((week, wIndex) => (
                        <React.Fragment key={wIndex}>
                            {week.map((day, dIndex) => {
                                if (!day) return <div key={`empty-${wIndex}-${dIndex}`} className="h-7"></div>;

                                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                                const isSelected = selectedDate && day === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();

                                return (
                                    <div key={day} className="flex flex-col items-center justify-center py-0.5">
                                        <button
                                            type="button"
                                            onClick={() => handleDateClick(day)}
                                            className={`
                                                w-6 h-6 flex items-center justify-center text-[12px] rounded-full transition-colors relative font-medium
                                                ${isSelected
                                                    ? 'bg-[#de4c4a] text-white hover:bg-[#c53d3b]'
                                                    : isToday
                                                        ? 'text-[#de4c4a] hover:bg-gray-100'
                                                        : 'text-[#202020] hover:bg-gray-100'
                                                }
                                            `}
                                        >
                                            {day}
                                        </button>
                                        <span className={`w-0.5 h-0.5 rounded-full mt-[1px] ${isSelected ? 'bg-transparent' : 'bg-gray-300'}`}></span>
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        );
    };

    const timeOptions = generateTimeOptions().filter(t => {
        if (!time) return true;
        const searchInput = time.replace(':', '');
        const optionTime = t.replace(':', '');
        return optionTime.startsWith(searchInput);
    });

    return (
        <div className="w-[240px] bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col pt-2 relative">
            <div className="px-2 pb-0.5">
                {renderCalendar()}
            </div>

            {/* Bottom Actions - Integrated Time Selector */}
            <div className="p-3 border-t border-gray-100 flex flex-col gap-2 bg-gray-50/30">
                <div className="flex items-center gap-2">
                    {/* Time Selector */}
                    <div className="flex-1 relative">
                        <div className={`flex items-center border border-gray-200 rounded-lg bg-white hover:border-gray-300 px-2.5 py-1.5 transition-all group ${time ? 'border-red-400 bg-red-50/5' : ''}`}>
                            <Clock size={14} className={`${time ? 'text-red-500' : 'text-gray-500'} mr-2 flex-shrink-0`} />
                            <input
                                type="text"
                                className={`w-full bg-transparent text-[12px] font-bold focus:outline-none ${time ? 'text-red-600' : 'text-gray-700'}`}
                                value={time}
                                placeholder="Час"
                                onChange={(e) => {
                                    setTime(e.target.value);
                                    setIsTimeDropdownOpen(true);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSaveTime();
                                    }
                                }}
                                onFocus={() => setIsTimeDropdownOpen(true)}
                                onBlur={() => setTimeout(() => setIsTimeDropdownOpen(false), 200)}
                            />
                            {time && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setTime('');
                                        handleSaveTime('');
                                    }}
                                    className="ml-1 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {isTimeDropdownOpen && timeOptions.length > 0 && (
                            <div className="absolute bottom-full left-0 mb-1 w-full max-h-[160px] overflow-y-auto bg-white border border-gray-100 rounded-lg shadow-xl z-20 scrollbar-hide">
                                {timeOptions.map(t => (
                                    <button
                                        key={t}
                                        type="button"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            setTime(t);
                                            handleSaveTime(t);
                                            setIsTimeDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 text-[12px] hover:bg-gray-50 transition-colors ${time === t ? 'bg-red-50 text-red-600 font-bold' : 'text-gray-700'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Repeat Selector */}
                    <div className="flex-1 relative">
                        <button
                            type="button"
                            onClick={() => setIsRepeatDropdownOpen(!isRepeatDropdownOpen)}
                            className={`w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-all ${repeat ? 'border-red-400 bg-red-50/5 text-red-600' : 'text-gray-700'}`}
                        >
                            <RefreshCcw size={14} className={`${repeat ? 'text-red-500' : 'text-gray-400'} flex-shrink-0`} />
                            <span className="text-[12px] font-bold truncate">
                                {repeat ? repeat.split(',')[0] : 'Повтор'}
                            </span>
                        </button>

                        {isRepeatDropdownOpen && (
                            <div className="absolute bottom-full right-0 mb-1 w-[200px] bg-white border border-gray-100 rounded-lg shadow-xl z-20 overflow-hidden">
                                <div className="py-1 max-h-[250px] overflow-y-auto scrollbar-hide">
                                    {[
                                        "Щогодини",
                                        "Щодня",
                                        "Будні",
                                        "Щотижня",
                                        "Щомісяця",
                                        "Щороку"
                                    ].map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => {
                                                setRepeat(opt);
                                                setIsRepeatDropdownOpen(false);
                                                // Save and close
                                                handleSaveTime(undefined, opt);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-[12px] hover:bg-gray-50 transition-colors ${repeat === opt ? 'bg-red-50 text-red-600 font-bold' : 'text-gray-700'}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setRepeat('');
                                            setIsRepeatDropdownOpen(false);
                                            handleSaveTime(undefined, '');
                                        }}
                                        className="w-full text-left px-4 py-2 text-[12px] text-red-500 hover:bg-red-50 border-t border-gray-50 mt-1"
                                    >
                                        Прибрати повторення
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {initialDate && onClear && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="w-full text-[10px] text-[#de4c4a] font-bold hover:underline py-0.5 text-center"
                    >Очистити дату</button>
                )}
            </div>
        </div>
    );
};

export const RepeatOnlyView = ({ initialRepeat, onChange, onClose }) => {
    const [repeat, setRepeat] = useState(initialRepeat || '');

    useEffect(() => {
        setRepeat(initialRepeat || '');
    }, [initialRepeat]);

    const options = [
        "Щогодини",
        "Щодня",
        "Будні",
        "Щотижня",
        "Щомісяця",
        "Щороку"
    ];

    return (
        <div
            className="w-[180px] min-w-[180px] flex flex-col items-stretch bg-white border border-gray-100 rounded-xl shadow-[0_10px_50px_rgba(0,0,0,0.2)] py-1 z-[210] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
        >
            {options.map((opt) => (
                <button
                    key={opt}
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setRepeat(opt);
                        onChange(opt);
                        if (onClose) onClose();
                    }}
                    className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-gray-50 transition-all block ${repeat === opt ? 'bg-red-50 text-red-600 font-bold' : 'text-gray-700'}`}
                >
                    {opt}
                </button>
            ))}
            {repeat && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setRepeat('');
                        onChange('');
                        if (onClose) onClose();
                    }}
                    className="w-full text-left px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 border-t border-gray-50 mt-1 block font-medium"
                >
                    Прибрати повторення
                </button>
            )}
        </div>
    );
};

export default CustomDatePicker;
