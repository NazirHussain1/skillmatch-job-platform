import { Bell } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const NotificationDropdown = ({
  notificationsOpen,
  unreadCount,
  notifications,
  isNotificationsLoading,
  onToggle,
  onMarkAsRead,
  formatTime,
  dropdownRef,
  isMobile = false,
}) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const notificationRefs = useRef([]);

  // Reset focused index when dropdown opens/closes
  useEffect(() => {
    if (notificationsOpen) {
      setFocusedIndex(-1);
      notificationRefs.current = [];
    }
  }, [notificationsOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!notificationsOpen) return;

    const handleKeyDown = (e) => {
      // Escape key closes dropdown
      if (e.key === 'Escape') {
        e.preventDefault();
        onToggle();
        return;
      }

      // Only handle arrow keys if we have notifications
      if (notifications.length === 0) return;

      // Arrow Down - move to next notification
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev < notifications.length - 1 ? prev + 1 : 0;
          notificationRefs.current[next]?.focus();
          return next;
        });
      }

      // Arrow Up - move to previous notification
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev > 0 ? prev - 1 : notifications.length - 1;
          notificationRefs.current[next]?.focus();
          return next;
        });
      }

      // Enter key - mark as read if unread
      if (e.key === 'Enter' && focusedIndex >= 0) {
        e.preventDefault();
        const notification = notifications[focusedIndex];
        if (notification && !notification.isRead) {
          onMarkAsRead(notification._id);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [notificationsOpen, notifications, focusedIndex, onToggle, onMarkAsRead]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={onToggle}
        className="relative p-2 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-95"
        title="Notifications"
        aria-label={notificationsOpen ? 'Close notifications' : 'Open notifications'}
        aria-haspopup="menu"
        aria-expanded={notificationsOpen}
        aria-controls={notificationsOpen ? `${isMobile ? 'mobile' : 'desktop'}-notifications-menu` : undefined}
      >
        <Bell size={isMobile ? 22 : 20} aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-600 text-white text-[10px] font-bold rounded-full shadow-sm ring-2 ring-white"
            aria-live="polite"
            aria-atomic="true"
            role="status"
          >
            <span aria-label={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {notificationsOpen && (
        <div
          id={`${isMobile ? 'mobile' : 'desktop'}-notifications-menu`}
          className={`
            absolute right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-[60]
            w-80 sm:w-96 max-w-[calc(100vw-2rem)]
            transition-all duration-200 ease-out
            animate-in fade-in slide-in-from-top-2
          `}
          role="menu"
          aria-labelledby={`${isMobile ? 'mobile' : 'desktop'}-notifications-title`}
          aria-orientation="vertical"
        >
          {/* Header */}
          <div className="sticky top-0 px-4 py-3 border-b border-gray-200 bg-white z-10 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <h3
                className="text-sm font-semibold text-gray-900"
                id={`${isMobile ? 'mobile' : 'desktop'}-notifications-title`}
              >
                Notifications
              </h3>
              <span
                className="text-xs text-gray-600 font-medium"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                {unreadCount} unread
              </span>
            </div>
          </div>

          {/* Keyboard Navigation Instructions */}
          <div className="sr-only" role="status" aria-live="polite">
            Use arrow keys to navigate notifications, Enter to mark as read, Escape to close
          </div>

          {/* Scrollable Content */}
          <div
            className="max-h-[50vh] sm:max-h-[60vh] md:max-h-96 overflow-y-auto scroll-smooth overscroll-contain"
            role="group"
            aria-label="Notification items"
          >
            {isNotificationsLoading ? (
              <div className="p-6 text-center transition-opacity duration-200" role="status" aria-live="polite">
                <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                <p className="mt-2 text-sm text-gray-600">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center transition-opacity duration-200" role="status">
                <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3 transition-transform duration-200 hover:scale-110" aria-hidden="true" />
                <p className="text-sm text-gray-600">No notifications yet.</p>
                <p className="text-xs text-gray-500 mt-1">
                  We'll notify you when something happens.
                </p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div
                  key={notification._id}
                  ref={(el) => (notificationRefs.current[index] = el)}
                  role="menuitem"
                  tabIndex={0}
                  className={`
                    p-4 border-b border-gray-100 last:border-b-0 transition-all duration-200
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500
                    ${notification.isRead 
                      ? 'bg-white hover:bg-gray-50 focus-visible:bg-gray-50' 
                      : 'bg-blue-50/70 hover:bg-blue-50 focus-visible:bg-blue-100/80 border-l-4 border-l-blue-500'
                    }
                  `}
                  aria-label={`${notification.isRead ? 'Read' : 'Unread'} notification: ${notification.message}. ${!notification.isRead ? 'Press Enter to mark as read.' : ''}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (!notification.isRead) {
                        onMarkAsRead(notification._id);
                      }
                    }
                  }}
                  onClick={() => {
                    setFocusedIndex(index);
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Unread Indicator */}
                    {!notification.isRead && (
                      <div
                        className="flex-shrink-0 w-2 h-2 mt-1.5 bg-blue-600 rounded-full ring-2 ring-blue-200 animate-pulse"
                        aria-hidden="true"
                        role="presentation"
                      />
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-relaxed break-words transition-colors duration-200 ${
                        notification.isRead ? 'text-gray-700' : 'text-gray-900 font-medium'
                      }`}>
                        {notification.message}
                      </p>

                      <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
                        <time 
                          className="text-xs text-gray-600 flex-shrink-0"
                          dateTime={notification.createdAt}
                        >
                          {formatTime(notification.createdAt)}
                        </time>
                        {!notification.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onMarkAsRead(notification._id);
                            }}
                            className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded px-1.5 py-1 transition-all duration-200"
                            aria-label={`Mark "${notification.message}" as read`}
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer (optional - shows when there are notifications) */}
          {!isNotificationsLoading && notifications.length > 0 && (
            <div className="sticky bottom-0 px-4 py-2 border-t border-gray-200 bg-gray-50 text-center transition-colors duration-200">
              <p className="text-xs text-gray-600" role="status">
                {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
