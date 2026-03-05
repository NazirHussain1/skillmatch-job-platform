import api from './api';

// Get or create conversation for an application
const getOrCreateConversation = async (applicationId) => {
  const response = await api.get(`/chat/conversation/${applicationId}`);
  return response.data.data;
};

// Get all conversations
const getConversations = async () => {
  const response = await api.get('/chat/conversations');
  return response.data.data;
};

// Get messages for a conversation
const getMessages = async (conversationId) => {
  const response = await api.get(`/chat/messages/${conversationId}`);
  return response.data.data;
};

// Send a message
const sendMessage = async (conversationId, content) => {
  const response = await api.post('/chat/messages', { conversationId, content });
  return response.data.data;
};

// Mark messages as read
const markMessagesAsRead = async (conversationId) => {
  const response = await api.put(`/chat/messages/read/${conversationId}`);
  return response.data.data;
};

const chatService = {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
};

export default chatService;
