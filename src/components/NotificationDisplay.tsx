import React from "react";
import { useNotificationContext } from "../contexts/NotificationContext";
import { CheckCircle, XCircle, AlertTriangle, X } from "lucide-react";

const NotificationDisplay: React.FC = () => {
  const { notifications, removeNotification } = useNotificationContext();

  if (notifications.length === 0) {
    return null;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "error":
        return <XCircle className="w-6 h-6 text-red-500" />;
      case "info":
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-start p-4 rounded-lg shadow-lg max-w-md border ${
            notification.type === "success"
              ? "bg-green-50 border-green-200"
              : notification.type === "error"
              ? "bg-red-50 border-red-200"
              : notification.type === "warning"
              ? "bg-yellow-50 border-yellow-200"
              : "bg-blue-50 border-blue-200"
          }`}
        >
          <div className="flex-shrink-0 mr-3">{getIcon(notification.type)}</div>
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-medium break-words ${
                notification.type === "success"
                  ? "text-green-800"
                  : notification.type === "error"
                  ? "text-red-800"
                  : notification.type === "warning"
                  ? "text-yellow-800"
                  : "text-blue-800"
              }`}
            >
              {notification.message}
            </p>
          </div>
          <div className="flex-shrink-0 ml-3">
            <button
              onClick={() => removeNotification(notification.id)}
              className={`bg-transparent rounded-md inline-flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                notification.type === "success"
                  ? "text-green-500 hover:bg-green-100 focus:ring-green-400"
                  : notification.type === "error"
                  ? "text-red-500 hover:bg-red-100 focus:ring-red-400"
                  : notification.type === "warning"
                  ? "text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-400"
                  : "text-blue-500 hover:bg-blue-100 focus:ring-blue-400"
              }`}
            >
              <span className="sr-only">Fechar</span>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationDisplay;
