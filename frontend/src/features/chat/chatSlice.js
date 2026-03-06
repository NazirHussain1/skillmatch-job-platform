import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import chatService from '../../services/chatService';

const initialState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Get or create conversation
export const getOrCreateConversation = createAsyncThunk(
  'chat/getOrCreateConversation',
  async (applicationId, thunkAPI) => {
    try {
      return await chatService.getOrCreateConversation(applicationId);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get all conversations
export const getConversations = createAsyncThunk(
  'chat/getConversations',
  async (_, thunkAPI) => {
    try {
      return await chatService.getConversations();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get messages
export const getMessages = createAsyncThunk(
  'chat/getMessages',
  async (conversationId, thunkAPI) => {
    try {
      return await chatService.getMessages(conversationId);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Send message
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ conversationId, content }, thunkAPI) => {
    try {
      return await chatService.sendMessage(conversationId, content);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Mark messages as read
export const markMessagesAsRead = createAsyncThunk(
  'chat/markMessagesAsRead',
  async (conversationId, thunkAPI) => {
    try {
      return await chatService.markMessagesAsRead(conversationId);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    reset: () => initialState,
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getOrCreateConversation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrCreateConversation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentConversation = action.payload;
      })
      .addCase(getOrCreateConversation.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getConversations.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.conversations = action.payload;
      })
      .addCase(getConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getMessages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.messages = action.payload;
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.messages.push(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(markMessagesAsRead.fulfilled, (state) => {
        state.messages = state.messages.map(msg => ({ ...msg, read: true }));
      });
  },
});

export const { reset, addMessage, setCurrentConversation } = chatSlice.actions;
export default chatSlice.reducer;
