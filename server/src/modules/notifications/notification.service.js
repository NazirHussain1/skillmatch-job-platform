import Notification from './notification.model.js';
import { emitToUser } from '../../config/socket.js';

class NotificationService {
  async createNotification(data) {
    const notification = await Notification.create(data);
    
    // Emit real-time notification
    emitToUser(data.userId.toString(), 'notification', {
      id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      createdAt: notification.createdAt
    });

    return notification;
  }

  async getUserNotifications(userId, filters = {}) {
    const { type, isRead, limit = 50, skip = 0 } = filters;
    
    const query = { userId };
    if (type) query.type = type;
    if (isRead !== undefined) query.isRead = isRead;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    return {
      notifications,
      total,
      unreadCount
    };
  }

  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );

    return notification;
  }

  async markAllAsRead(userId) {
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    return { success: true };
  }

  async deleteNotification(notificationId, userId) {
    await Notification.findOneAndDelete({ _id: notificationId, userId });
    return { success: true };
  }
}

export default new NotificationService();
