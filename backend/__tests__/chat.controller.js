jest.mock('../models/Conversation.model', () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  create: jest.fn()
}));

jest.mock('../models/Message.model', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  updateMany: jest.fn()
}));

jest.mock('../models/Application.model', () => ({
  findById: jest.fn()
}));

const Conversation = require('../models/Conversation.model');
const Message = require('../models/Message.model');
const Application = require('../models/Application.model');
const {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead
} = require('../controllers/chat.controller');

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

const id = (value) => ({ toString: () => value });

describe('chat controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 404 when creating a conversation for a missing application', async () => {
    const populateApplicant = jest.fn().mockResolvedValue(null);
    const populateJob = jest.fn().mockReturnValue({ populate: populateApplicant });
    Application.findById.mockReturnValue({ populate: populateJob });

    const { res, next } = await runController(getOrCreateConversation, {
      params: { applicationId: 'application-1' },
      user: { _id: id('user-1') }
    });

    expect(Conversation.findOne).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Application not found'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('blocks users who are neither applicant nor employer from a conversation', async () => {
    const application = {
      applicant: { _id: id('applicant-1') },
      job: { employer: id('employer-1') }
    };
    const populateApplicant = jest.fn().mockResolvedValue(application);
    const populateJob = jest.fn().mockReturnValue({ populate: populateApplicant });
    Application.findById.mockReturnValue({ populate: populateJob });

    const { res, next } = await runController(getOrCreateConversation, {
      params: { applicationId: 'application-1' },
      user: { _id: id('other-user') }
    });

    expect(Conversation.findOne).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Not authorized to access this conversation'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('creates and returns a conversation when one does not exist', async () => {
    const application = {
      applicant: { _id: id('applicant-1') },
      job: { employer: id('employer-1') }
    };
    const populatedConversation = { _id: 'conversation-1' };
    const populateApplicant = jest.fn().mockResolvedValue(application);
    const populateJob = jest.fn().mockReturnValue({ populate: populateApplicant });
    const populateLastMissing = jest.fn().mockResolvedValue(null);
    const populateParticipantsMissing = jest.fn().mockReturnValue({ populate: populateLastMissing });
    const populateLastCreated = jest.fn().mockResolvedValue(populatedConversation);
    const populateParticipantsCreated = jest.fn().mockReturnValue({ populate: populateLastCreated });
    Application.findById.mockReturnValue({ populate: populateJob });
    Conversation.findOne.mockReturnValue({ populate: populateParticipantsMissing });
    Conversation.create.mockResolvedValue({ _id: 'conversation-1' });
    Conversation.findById.mockReturnValue({ populate: populateParticipantsCreated });

    const { res, next } = await runController(getOrCreateConversation, {
      params: { applicationId: 'application-1' },
      user: { _id: id('applicant-1') }
    });

    expect(Conversation.create).toHaveBeenCalledWith({
      participants: [application.applicant._id, application.job.employer],
      application: 'application-1'
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Conversation retrieved successfully',
      data: populatedConversation
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('lists conversations for the current user', async () => {
    const conversations = [{ _id: 'conversation-1' }];
    const query = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(conversations)
    };
    Conversation.find.mockReturnValue(query);

    const { res, next } = await runController(getConversations, {
      user: { _id: 'user-1' }
    });

    expect(Conversation.find).toHaveBeenCalledWith({ participants: 'user-1' });
    expect(query.populate).toHaveBeenCalledWith('participants', 'name email role profilePicture companyName');
    expect(query.populate).toHaveBeenCalledWith('lastMessage');
    expect(query.populate).toHaveBeenCalledWith({
      path: 'application',
      populate: {
        path: 'job',
        select: 'title company'
      }
    });
    expect(query.sort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Conversations retrieved successfully',
      data: conversations
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('blocks non-participants from reading messages', async () => {
    Conversation.findById.mockResolvedValue({
      participants: [id('participant-1')]
    });

    const { res, next } = await runController(getMessages, {
      params: { conversationId: 'conversation-1' },
      user: { _id: id('other-user') }
    });

    expect(Message.find).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Not authorized to access this conversation'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns messages for conversation participants', async () => {
    const messages = [{ _id: 'message-1', content: 'Hello' }];
    const query = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(messages)
    };
    Conversation.findById.mockResolvedValue({
      participants: [id('user-1')]
    });
    Message.find.mockReturnValue(query);

    const { res, next } = await runController(getMessages, {
      params: { conversationId: 'conversation-1' },
      user: { _id: id('user-1') }
    });

    expect(Message.find).toHaveBeenCalledWith({ conversation: 'conversation-1' });
    expect(query.populate).toHaveBeenCalledWith('sender', 'name email role profilePicture');
    expect(query.sort).toHaveBeenCalledWith({ createdAt: 1 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Messages retrieved successfully',
      data: messages
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('sends a message and updates the conversation last message', async () => {
    const userId = id('user-1');
    const conversation = {
      participants: [userId],
      save: jest.fn().mockResolvedValue(undefined)
    };
    const populatedMessage = { _id: 'message-1', content: 'Hello' };
    const populateSender = jest.fn().mockResolvedValue(populatedMessage);
    Conversation.findById.mockResolvedValue(conversation);
    Message.create.mockResolvedValue({ _id: 'message-1' });
    Message.findById.mockReturnValue({ populate: populateSender });

    const { res, next } = await runController(sendMessage, {
      body: {
        conversationId: 'conversation-1',
        content: 'Hello'
      },
      user: { _id: userId }
    });

    expect(Message.create).toHaveBeenCalledWith({
      conversation: 'conversation-1',
      sender: userId,
      content: 'Hello'
    });
    expect(conversation.lastMessage).toBe('message-1');
    expect(conversation.save).toHaveBeenCalledWith();
    expect(populateSender).toHaveBeenCalledWith('sender', 'name email role profilePicture');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Message sent successfully',
      data: populatedMessage
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('marks other participants unread messages as read', async () => {
    const userId = id('user-1');
    Conversation.findById.mockResolvedValue({
      participants: [userId]
    });
    Message.updateMany.mockResolvedValue({ modifiedCount: 2 });

    const { res, next } = await runController(markMessagesAsRead, {
      params: { conversationId: 'conversation-1' },
      user: { _id: userId }
    });

    expect(Message.updateMany).toHaveBeenCalledWith(
      {
        conversation: 'conversation-1',
        sender: { $ne: userId },
        read: false
      },
      { read: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Messages marked as read',
      data: null
    });
    expect(next).not.toHaveBeenCalled();
  });
});
