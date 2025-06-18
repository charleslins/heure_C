
import React from 'react';
import { useNotificationContext } from '../contexts/NotificationContext';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from './icons'; // Assuming you have these icons

const NotificationDisplay: React.FC = () => {
  const { notifications, removeNotification } = useNotificationContext();

  if (notifications.length === 0) {
    return null;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'error':
        return <XCircleIcon className="w-6 h-6 text-red-500" />;
      case 'info':
        return <InformationCircleIcon className="w-6 h-6 text-blue-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-400 text-green-700';
      case 'error':
        return 'bg-red-50 border-red-400 text-red-700';
      case 'info':
        return 'bg-blue-50 border-blue-400 text-blue-700';
      case 'warning':
        return 'bg-yellow-50 border-yellow-400 text-yellow-700';
      default:
        return 'bg-slate-50 border-slate-400 text-slate-700';
    }
  };

  return (
    <div className="fixed top-5 right-5 z-[100] space-y-3 w-full max-w-xs sm:max-w-sm print:hidden">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-xl border-l-4 flex items-start space-x-3 transition-all duration-300 ease-in-out transform animate-fadeIn ${getStyles(notification.type)}`}
          role="alert"
        >
          <div className="flex-shrink-0 pt-0.5">
            {getIcon(notification.type)}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className={`ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-md inline-flex items-center justify-center hover:bg-opacity-20 transition-colors ${getStyles(notification.type).split(' ')[0].replace('bg-', 'hover:bg-')}`}
            aria-label="Close"
          >
            <span className="sr-only">Close</span>
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      ))}
      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default NotificationDisplay;
