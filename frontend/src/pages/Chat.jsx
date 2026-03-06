import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getConversations, getOrCreateConversation, getMessages, sendMessage as sendMsg, addMessage, markMessagesAsRead } from '../features/chat/chatSlice';
import { useSocket } from '../context/SocketContext';
import { MessageCircle, Send, User } from 'lucide-react';
import { getOptimizedCloudinaryUrl } from '../utils/cloudinary';

function Chat() {
  const dispatch = useDispatch();
  const socket = useSocket();
  const [searchParams] = useSearchParams();
  const applicationId = searchParams.get('application');
  
  const { user } = useSelector((state) => state.auth);
  const { conversations, messages } = useSelector((state) => state.chat);
  
  const [messageInput, setMessageInput] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    dispatch(getConversations());
  }, [dispatch]);

  useEffect(() => {
    if (applicationId) {
      dispatch(getOrCreateConversation(applicationId)).then((result) => {
        if (result.payload) {
          setSelectedConversation(result.payload);
          dispatch(getMessages(result.payload._id));
        }
      });
    }
  }, [applicationId, dispatch]);

  useEffect(() => {
    if (selectedConversation && socket) {
      socket.emit('join-conversation', selectedConversation._id);
      dispatch(markMessagesAsRead(selectedConversation._id));

      return () => {
        socket.emit('leave-conversation', selectedConversation._id);
      };
    }
  }, [selectedConversation, socket, dispatch]);

  useEffect(() => {
    if (socket) {
      socket.on('receive-message', (message) => {
        dispatch(addMessage(message));
        scrollToBottom();
      });

      socket.on('user-typing', () => {
        setIsTyping(true);
      });

      socket.on('user-stop-typing', () => {
        setIsTyping(false);
      });

      return () => {
        socket.off('receive-message');
        socket.off('user-typing');
        socket.off('user-stop-typing');
      };
    }
  }, [socket, dispatch]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    dispatch(getMessages(conversation._id));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !selectedConversation) return;

    try {
      const result = await dispatch(sendMsg({
        conversationId: selectedConversation._id,
        content: messageInput
      })).unwrap();

      // Emit socket event
      if (socket) {
        socket.emit('send-message', {
          conversationId: selectedConversation._id,
          message: result
        });
      }

      setMessageInput('');
    } catch (error) {
      toast.error(error || 'Failed to send message');
    }
  };

  const handleTyping = () => {
    if (socket && selectedConversation) {
      socket.emit('typing', {
        conversationId: selectedConversation._id,
        userId: user._id
      });
    }
  };

  const handleStopTyping = () => {
    if (socket && selectedConversation) {
      socket.emit('stop-typing', {
        conversationId: selectedConversation._id,
        userId: user._id
      });
    }
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(p => p._id !== user._id);
  };

  const activeParticipant = selectedConversation ? getOtherParticipant(selectedConversation) : null;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4">
      {/* Conversations List */}
      <div className="w-full lg:w-1/3 card overflow-y-auto max-h-72 lg:max-h-none">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
        
        {conversations.length > 0 ? (
          <div className="space-y-2">
            {conversations.map((conversation) => {
              const otherUser = getOtherParticipant(conversation);
              return (
                <div
                  key={conversation._id}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation?._id === conversation._id
                      ? 'bg-primary-100'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {otherUser?.profilePicture ? (
                        <img
                          src={getOptimizedCloudinaryUrl(otherUser.profilePicture, {
                            width: 96,
                            height: 96,
                            crop: 'fill',
                            gravity: 'face'
                          })}
                          alt={otherUser?.name || 'User'}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {otherUser?.companyName || otherUser?.name}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.application?.job?.title}
                      </p>
                      {conversation.lastMessage && (
                        <p className="text-xs text-gray-500 truncate">
                          {conversation.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No conversations yet</p>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 card flex flex-col min-h-0">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="border-b pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  {activeParticipant?.profilePicture ? (
                    <img
                      src={getOptimizedCloudinaryUrl(activeParticipant.profilePicture, {
                        width: 96,
                        height: 96,
                        crop: 'fill',
                        gravity: 'face'
                      })}
                      alt={activeParticipant.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-600" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {activeParticipant?.companyName || activeParticipant?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedConversation.application?.job?.title}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${
                    message.sender._id === user._id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] rounded-lg p-3 ${
                      message.sender._id === user._id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender._id === user._id ? 'text-primary-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 rounded-lg p-3">
                    <p className="text-gray-600 text-sm">Typing...</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onFocus={handleTyping}
                onBlur={handleStopTyping}
                placeholder="Type a message..."
                className="flex-1 input-field"
              />
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="btn-primary flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
