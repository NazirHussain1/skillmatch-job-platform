import api from './api';

const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data.data;
};

const markNotificationAsRead = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data.data;
};

const notificationService = {
  getNotifications,
  markNotificationAsRead
};

export default notificationService;
