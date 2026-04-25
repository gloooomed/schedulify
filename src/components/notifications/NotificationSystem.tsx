import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  Settings,
  Filter,
  Calendar,
  Users,
  BookOpen
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  category: 'system' | 'schedule' | 'conflict' | 'ai' | 'user';
  actionUrl?: string;
}

interface NotificationSystemProps {
  className?: string;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({ className = '' }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  // Sample notifications
  useEffect(() => {
    const sampleNotifications: Notification[] = [
      {
        id: '1',
        type: 'success',
        title: 'Timetable Generated',
        message: 'Computer Science Semester 6 timetable generated with 95% optimization score',
        timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        read: false,
        category: 'ai'
      },
      {
        id: '2',
        type: 'warning',
        title: 'Conflict Detected',
        message: 'Room A101 has overlapping bookings on Tuesday 2-3 PM',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        read: false,
        category: 'conflict'
      },
      {
        id: '3',
        type: 'info',
        title: 'Faculty Availability Updated',
        message: 'Dr. Sarah Johnson updated availability for next week',
        timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        read: true,
        category: 'user'
      },
      {
        id: '4',
        type: 'success',
        title: 'Optimization Complete',
        message: 'AI successfully resolved 8 scheduling conflicts automatically',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false,
        category: 'ai'
      },
      {
        id: '5',
        type: 'info',
        title: 'System Maintenance',
        message: 'Scheduled maintenance will occur tonight from 11 PM to 1 AM',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        read: true,
        category: 'system'
      }
    ];

    setNotifications(sampleNotifications);
    setUnreadCount(sampleNotifications.filter(n => !n.read).length);
  }, []);

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.category === filter;
  });

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  // Delete notification
  const deleteNotification = (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Get icon for notification type
  const getNotificationIcon = (type: string, category: string) => {
    if (category === 'ai') return <BookOpen className="h-5 w-5" />;
    if (category === 'schedule') return <Calendar className="h-5 w-5" />;
    if (category === 'user') return <Users className="h-5 w-5" />;
    if (category === 'system') return <Settings className="h-5 w-5" />;
    
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  // Get notification color classes
  const getNotificationClasses = (type: string, read: boolean) => {
    const baseClasses = `p-4 border-l-4 ${read ? 'bg-gray-50' : 'bg-white'}`;
    
    switch (type) {
      case 'success':
        return `${baseClasses} border-green-500`;
      case 'warning':
        return `${baseClasses} border-orange-500`;
      case 'error':
        return `${baseClasses} border-red-500`;
      default:
        return `${baseClasses} border-blue-500`;
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate receiving a new notification every 30 seconds for demo
      const randomNotifications = [
        {
          type: 'info' as const,
          title: 'New Timetable Request',
          message: 'Mathematics department requested new timetable generation',
          category: 'schedule' as const
        },
        {
          type: 'success' as const,
          title: 'AI Optimization',
          message: 'Successfully optimized Physics department schedule',
          category: 'ai' as const
        },
        {
          type: 'warning' as const,
          title: 'Resource Conflict',
          message: 'Lab B201 shows potential booking conflict next week',
          category: 'conflict' as const
        }
      ];

      if (Math.random() > 0.7) { // 30% chance to add notification
        const randomNotification = randomNotifications[Math.floor(Math.random() * randomNotifications.length)];
        const newNotification: Notification = {
          id: Date.now().toString(),
          ...randomNotification,
          timestamp: new Date(),
          read: false
        };

        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Show toast notification
        toast.success(newNotification.title, {
          icon: '🔔',
          duration: 4000,
        });
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Notification Bell Button */}
      <div className={`relative ${className}`}>
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notification Panel */}
        <AnimatePresence>
          {showPanel && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                  <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setShowPanel(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex items-center space-x-2 mt-3">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="all">All</option>
                    <option value="unread">Unread</option>
                    <option value="ai">AI & Optimization</option>
                    <option value="schedule">Schedule</option>
                    <option value="conflict">Conflicts</option>
                    <option value="system">System</option>
                    <option value="user">User Activity</option>
                  </select>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No notifications to show</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredNotifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`${getNotificationClasses(notification.type, notification.read)} cursor-pointer hover:bg-gray-100 transition-colors duration-200`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="mt-1">
                              {getNotificationIcon(notification.type, notification.category)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                                {notification.title}
                              </p>
                              <p className={`text-sm mt-1 ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-500">
                                  {formatTimestamp(notification.timestamp)}
                                </span>
                                {!notification.read && (
                                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="text-gray-400 hover:text-gray-600 ml-2"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {filteredNotifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 text-center">
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    View all notifications
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toast Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10B981',
            },
          },
          error: {
            style: {
              background: '#EF4444',
            },
          },
        }}
      />
    </>
  );
};