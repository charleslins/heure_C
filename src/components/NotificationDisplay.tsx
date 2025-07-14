import React from "react";
import { useNotificationContext } from "../contexts/NotificationContext";
import Alert from "./common/Alert";

const NotificationDisplay: React.FC = () => {
  const { notifications, removeNotification } = useNotificationContext();

  if (notifications.length === 0) {
    return null;
  }



  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <Alert
          key={notification.id}
          variant={notification.type as "success" | "error" | "warning" | "info"}
          onClose={() => removeNotification(notification.id)}
          className="shadow-lg max-w-md"
        >
          <p className="text-sm font-medium break-words">
            {notification.message}
          </p>
        </Alert>
      ))}
    </div>
  );
};

export default NotificationDisplay;
