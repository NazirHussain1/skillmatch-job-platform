import { Bell } from 'lucide-react';

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
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={onToggle}
        className="relative p-2 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-95"
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
            animate-in fade-in slide-in-from-top-2 duration-200
          `}
          role="menu"
          aria-labelledby={`${isMobile ? 'mobile' : 'desktop'}-notifications-title`}
          aria-orientation="vertical"
        >
          {/* Header */}
          <div className="sticky top-0 px-4 py-3 border-b border-gray-200 bg-gray-50/95 backdrop-blur-sm z-10">
            <div className="flex items-center justify-between">
              <h3
                className="text-sm font-semibold text-gray-900"
                id={`${isMobile ? 'mobile' : 'desktop'}-notifications-title`}
              >
                Notifications
              </h3>
              <span
                className="text-xs text-gray-500 font-medium"
                role="status"
                aria-live="polite"
              >
                {unreadCount} unread
              </span>
            </div>
          </div>

          {/* Scrollable Content */}
          <div
            className="max-h-[60vh] sm:max-h-96 overflow-y-auto scroll-smooth overscroll-contain"
            role="group"
            aria-label="Notification items"
          >
            {isNotificationsLoading ? (
              <div className="p-6 text-center" role="status" aria-live="polite">
                <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                <p className="mt-2 text-sm text-gray-500">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center" role="status">
                <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" aria-hidden="true" />
                <p className="text-sm text-gray-500">No notifications yet.</p>
                <p className="text-xs text-gray-400 mt-1">
                  We'll notify you when something happens.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  role="menuitem"
                  tabIndex={0}
                  className={`
                    p-4 border-b border-gray-100 last:border-b-0 transition-colors duration-150
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500
                    ${notification.isRead ? 'bg-white hover:bg-gray-50 focus-visible:bg-gray-50' : 'bg-blue-50/60 hover:bg-blue-50 focus-visible:bg-blue-100/70'}
                  `}
                  aria-label={`${notification.isRead ? 'Read' : 'Unread'} notification: ${notification.message}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Unread Indicator */}
                    {!notification.isRead && (
                      <div
                        className="flex-shrink-0 w-2 h-2 mt-1.5 bg-blue-600 rounded-full ring-2 ring-blue-200"
                        aria-hidden="true"
                        role="presentation"
                      />
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 leading-relaxed break-words">
                        {notification.message}
                      </p>

                      <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
                        <time 
                          className="text-xs text-gray-500 flex-shrink-0"
                          dateTime={notification.createdAt}
                        >
                          {formatTime(notification.createdAt)}
                        </time>
                        {!notification.isRead && (
                          <button
                            onClick={() => onMarkAsRead(notification._id)}
                            className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded px-1.5 py-1 transition-colors"
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
            <div className="sticky bottom-0 px-4 py-2 border-t border-gray-200 bg-gray-50/95 backdrop-blur-sm text-center">
              <p className="text-xs text-gray-500" role="status">
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
