import * as ReactModule from 'react';
const React = ReactModule.default || ReactModule;
const { useEffect } = React;
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Notification = ({ message, type = 'info', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const icons = {
        success: <CheckCircle2 className="text-green-500" size={18} />,
        error: <AlertCircle className="text-red-500" size={18} />,
        warning: <AlertTriangle className="text-orange-500" size={18} />,
        info: <Info className="text-blue-500" size={18} />
    };

    const borderColors = {
        success: 'border-l-green-500',
        error: 'border-l-red-500',
        warning: 'border-l-orange-500',
        info: 'border-l-blue-500'
    };

    return (
        <div className={`fixed top-5 right-5 bg-white border border-gray-200 ${borderColors[type]} border-l-4 rounded-lg p-4 shadow-lg z-[1000] animate-in slide-in-from-right duration-300 max-w-[300px]`}>
            <div className="flex items-center gap-3">
                {icons[type]}
                <span className="text-sm font-medium text-gray-700">{message}</span>
            </div>
        </div>
    );
};

export default Notification;
