import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { chatService, createAuthenticatedApi } from '../services/api';

// Async thunks
export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (getToken, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await chatService.getConversations(authApi);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversations');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ getToken, userId, page = 1 }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await chatService.getMessages(authApi, userId, page);
      return { userId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ getToken, receiverId, message }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await chatService.sendMessage(authApi, receiverId, message);
      return { receiverId, message: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

const initialState = {
  conversations: [],
  currentChatUserId: null,
  messages: {},  // Keyed by userId
  loading: false,
  messagesLoading: false,
  sendingMessage: false,
  error: null,
  onlineUsers: [],
  typingUsers: {}, // userId -> boolean
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentChat: (state, action) => {
      state.currentChatUserId = action.payload;
    },
    clearCurrentChat: (state) => {
      state.currentChatUserId = null;
    },
    addMessage: (state, action) => {
      const { senderId, message } = action.payload;
      // Determine which user's chat this belongs to (the other person)
      const chatUserId = senderId;
      if (!state.messages[chatUserId]) {
        state.messages[chatUserId] = [];
      }
      state.messages[chatUserId].push(message);
      
      // Update conversation's last message
      const conversationIndex = state.conversations.findIndex(
        c => c.user._id === chatUserId
      );
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex].lastMessage = {
          message: message.message,
          createdAt: message.createdAt,
          senderId: message.senderId,
        };
        state.conversations[conversationIndex].unreadCount += 1;
        // Move to top
        const [conversation] = state.conversations.splice(conversationIndex, 1);
        state.conversations.unshift(conversation);
      }
    },
    markConversationAsRead: (state, action) => {
      const userId = action.payload;
      const conversationIndex = state.conversations.findIndex(
        c => c.user._id === userId
      );
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex].unreadCount = 0;
      }
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    setTypingUser: (state, action) => {
      const { userId, isTyping } = action.payload;
      state.typingUsers[userId] = isTyping;
    },
    addNewConversation: (state, action) => {
      // Add a new conversation if it doesn't exist
      const user = action.payload;
      const exists = state.conversations.some(c => c.user._id === user._id);
      if (!exists) {
        state.conversations.unshift({
          user: {
            _id: user._id,
            name: user.name,
            profileImage: user.profileImage,
            isOnline: state.onlineUsers.includes(user._id),
          },
          lastMessage: null,
          unreadCount: 0,
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch conversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload || [];
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.messagesLoading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        const { userId, messages } = action.payload;
        state.messages[userId] = messages || [];
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.messagesLoading = false;
        state.error = action.payload;
      })
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.sendingMessage = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sendingMessage = false;
        const { receiverId, message } = action.payload;
        if (!state.messages[receiverId]) {
          state.messages[receiverId] = [];
        }
        state.messages[receiverId].push(message);
        
        // Update conversation's last message
        const conversationIndex = state.conversations.findIndex(
          c => c.user._id === receiverId
        );
        if (conversationIndex !== -1) {
          state.conversations[conversationIndex].lastMessage = {
            message: message.message,
            createdAt: message.createdAt,
            senderId: message.senderId,
          };
          // Move to top
          const [conversation] = state.conversations.splice(conversationIndex, 1);
          state.conversations.unshift(conversation);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sendingMessage = false;
        state.error = action.payload;
      });
  },
});

export const {
  setCurrentChat,
  clearCurrentChat,
  addMessage,
  markConversationAsRead,
  setOnlineUsers,
  setTypingUser,
  addNewConversation,
} = chatSlice.actions;

export default chatSlice.reducer;
