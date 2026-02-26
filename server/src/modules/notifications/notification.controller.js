import notificationService from './notification.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../config/constants.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const { type, isRead, limit, skip } = req.query;
  
  const result = await notificationService.getUserNotifications(req.user._id, {
    type,
    isRead: isRead === 'true',
    limit: parseInt(limit) || 50,
    skip: parseInt(skip) || 0
  });

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(result, 'Notifications retrieved successfully')
  );
});

export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(
    req.params.id,
    req.user._id
  );

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(notification, 'Notification marked as read')
  );
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user._id);

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(result, 'All notifications marked as read')
  );
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const result = await notificationService.deleteNotification(
    req.params.id,
    req.user._id
  );

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(result, 'Notification deleted')
  );
});
