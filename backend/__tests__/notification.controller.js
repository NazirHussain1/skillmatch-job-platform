jest.mock('../models/Notification.model', () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  countDocuments: jest.fn()
}));

const Notification = require('../models/Notification.model');
const {
  getNotifications,
  markNotificationAsRead
} = require('../controllers/notification.controller');

const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

const createResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
});

const runController = async (controller, req, res = createResponse()) => {
  const next = jest.fn();
  controller(req, res, next);
  await flushPromises();
  return { res, next };
};

describe('notification controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns recent notifications and unread count for the current user', async () => {
    const notifications = [
      { _id: 'notification-1', message: 'Application received', isRead: false }
    ];
    const query = {
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(notifications)
    };
    Notification.find.mockReturnValue(query);
    Notification.countDocuments.mockResolvedValue(3);

    const { res, next } = await runController(getNotifications, {
      user: { _id: 'user-1' }
    });

    expect(Notification.find).toHaveBeenCalledWith({ userId: 'user-1' });
    expect(query.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(query.limit).toHaveBeenCalledWith(30);
    expect(Notification.countDocuments).toHaveBeenCalledWith({
      userId: 'user-1',
      isRead: false
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Notifications retrieved successfully',
      data: {
        notifications,
        unreadCount: 3
      }
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 404 when marking a notification that does not belong to the user', async () => {
    Notification.findOne.mockResolvedValue(null);

    const { res, next } = await runController(markNotificationAsRead, {
      params: { id: 'notification-1' },
      user: { _id: 'user-1' }
    });

    expect(Notification.findOne).toHaveBeenCalledWith({
      _id: 'notification-1',
      userId: 'user-1'
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Notification not found'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('marks a notification as read', async () => {
    const notification = {
      _id: 'notification-1',
      isRead: false,
      save: jest.fn().mockResolvedValue(undefined)
    };
    Notification.findOne.mockResolvedValue(notification);

    const { res, next } = await runController(markNotificationAsRead, {
      params: { id: 'notification-1' },
      user: { _id: 'user-1' }
    });

    expect(notification.isRead).toBe(true);
    expect(notification.save).toHaveBeenCalledWith();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
    expect(next).not.toHaveBeenCalled();
  });
});
