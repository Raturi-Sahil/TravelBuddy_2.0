import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { createAuthenticatedApi, activityService } from '../services/api';

const initialState = {
  activities: [],
  myActivities: [],
  currentActivity: null,
  isLoading: false,
  isCreating: false,
  isPaymentProcessing: false,
  paymentSessionId: null,
  error: null,
};

// Async Thunk to create an activity
export const createActivity = createAsyncThunk(
  'activity/create',
  async ({ getToken, activityData }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await activityService.createActivity(authApi, activityData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create activity'
      );
    }
  }
);

// Async Thunk to fetch all activities
export const fetchActivities = createAsyncThunk(
  'activity/fetchAll',
  async (getToken, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await activityService.getActivities(authApi);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch activities'
      );
    }
  }
);

// Async Thunk to fetch a single activity by ID
export const fetchActivityById = createAsyncThunk(
  'activity/fetchById',
  async ({ getToken, id }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await activityService.getActivityById(authApi, id);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch activity'
      );
    }
  }
);

// Async Thunk to create payment order for joining activity
export const createActivityPayment = createAsyncThunk(
  'activity/createPayment',
  async ({ getToken, activityId }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await activityService.createPaymentOrder(authApi, activityId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create payment'
      );
    }
  }
);

// Async Thunk to verify payment and join activity
export const verifyActivityPayment = createAsyncThunk(
  'activity/verifyPayment',
  async ({ getToken, orderId, activityId }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await activityService.verifyPayment(authApi, { orderId, activityId });
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to verify payment'
      );
    }
  }
);

// Async Thunk to invite users
export const inviteUsersToActivity = createAsyncThunk(
  'activity/inviteUsers',
  async ({ getToken, activityId, userIds }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await activityService.inviteUsers(authApi, activityId, userIds);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to invite users'
      );
    }
  }
);

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetActivityState: (state) => {
      state.isCreating = false;
      state.error = null;
      state.currentActivity = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Activity
      .addCase(createActivity.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createActivity.fulfilled, (state, action) => {
        state.isCreating = false;
        state.currentActivity = action.payload.data;
        // Add the new activity to limits/lists if needed
        state.myActivities.push(action.payload.data);
        state.error = null;
      })
      .addCase(createActivity.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload || 'Failed to create activity';
      })

      // Fetch Activities
      .addCase(fetchActivities.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activities = action.payload.data;
        state.error = null;
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch activities';
      })

      // Fetch Single Activity
      .addCase(fetchActivityById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActivityById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentActivity = action.payload.data;
        state.error = null;
      })
      .addCase(fetchActivityById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch activity';
      })

      // Create Activity Payment
      .addCase(createActivityPayment.pending, (state) => {
        state.isPaymentProcessing = true;
        state.paymentSessionId = null;
        state.error = null;
      })
      .addCase(createActivityPayment.fulfilled, (state, action) => {
        state.isPaymentProcessing = false;
        // Check if it's a free activity (joined directly)
        if (action.payload.data?.isFree) {
          state.currentActivity = action.payload.data.activity;
        } else {
          state.paymentSessionId = action.payload.data?.payment_session_id;
        }
        state.error = null;
      })
      .addCase(createActivityPayment.rejected, (state, action) => {
        state.isPaymentProcessing = false;
        state.error = action.payload || 'Failed to create payment';
      })

      // Verify Activity Payment
      .addCase(verifyActivityPayment.pending, (state) => {
        state.isPaymentProcessing = true;
        state.error = null;
      })
      .addCase(verifyActivityPayment.fulfilled, (state, action) => {
        state.isPaymentProcessing = false;
        if (action.payload.data?.activity) {
          state.currentActivity = action.payload.data.activity;
        }
        state.paymentSessionId = null;
        state.error = null;
      })
      .addCase(verifyActivityPayment.rejected, (state, action) => {
        state.isPaymentProcessing = false;
        state.error = action.payload || 'Failed to verify payment';
      });
  },
});

export const { clearError, resetActivityState } = activitySlice.actions;
export default activitySlice.reducer;
