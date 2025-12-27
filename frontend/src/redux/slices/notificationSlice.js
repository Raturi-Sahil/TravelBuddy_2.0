import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { notificationService, createAuthenticatedApi } from "../services/api";

// Thunks
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (getToken, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const data = await notificationService.getNotifications(authApi);
      return data.data; // Assuming API returns { success: true, data: [...] }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch notifications"
      );
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async ({ id, getToken }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const data = await notificationService.markAsRead(authApi, id);
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark notification as read"
      );
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (getToken, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      await notificationService.markAllAsRead(authApi); // Don't need data
      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark all notifications as read"
      );
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    notifications: [],
    loading: false,
    error: null,
    unreadCount: 0,
  },
  reducers: {
    addNotification: (state, action) => {
      // Add new notification to the top
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    clearNotifications: (state) => {
       state.notifications = [];
       state.unreadCount = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Mark As Read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex((n) => n._id === action.payload._id);
        if (index !== -1) {
          state.notifications[index] = action.payload;
          // Recalculate unread count
          state.unreadCount = state.notifications.filter((n) => !n.isRead).length;
        }
      })

      // Mark All As Read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((n) => ({ ...n, isRead: true }));
        state.unreadCount = 0;
      });
  },
});

export const { addNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
