import { useState, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import axiosClient from '../../api/axiosClient'; 
import { useAuth } from '../../context/AuthContext'; 

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (user?.id) {
      const fetchNotifications = () => {
        axiosClient.get(`/notifications/${user.id}`)
          .then(res => {
            setNotifications(res.data);
            setHasUnread(res.data.some(n => !n.isRead));
          })
          .catch(err => console.error("Notification Error", err));
      };

      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); 
      return () => clearInterval(interval);
    }
  }, [user]);

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
    // Optional: Mark as read logic here
    if (hasUnread) setHasUnread(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={toggleNotifications} 
        className="relative p-2 text-gray-400 hover:text-cyan-400 transition-colors"
      >
        <BellIcon className="w-6 h-6" />
        {hasUnread && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-gray-950 animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
          <div className="p-3 border-b border-gray-800 flex justify-between items-center">
            <span className="font-bold text-gray-300 text-sm">NOTIFICATIONS</span>
            <span className="text-xs text-cyan-500">{notifications.length} Total</span>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-600 text-xs">
                No new transmissions.
              </div>
            ) : (
              notifications.map(n => (
                <div key={n._id} className={`p-3 border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors ${!n.isRead ? 'bg-cyan-900/10' : ''}`}>
                  <p className="text-gray-200 text-sm">{n.message}</p>
                  <p className="text-[10px] text-gray-500 mt-1 font-mono">
                    {new Date(n.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}