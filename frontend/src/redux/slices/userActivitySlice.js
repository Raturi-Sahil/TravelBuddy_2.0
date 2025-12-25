import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { createAuthenticatedApi, activityService } from '../services/api';

const initialState = {
  joinedActivities: [],
  createdActivities: [],
  singleActivity: null,
  participants: [],
  loading: false,
  createdLoading: false,
  singleLoading: false,
  error: null,
};

// Async Thunk to fetch user's joined activities
export const getJoinedActivities = createAsyncThunk(
  'userActivity/getJoinedActivities',
  async (_, { getState, rejectWithValue }) => {
    try {
      // Get the getToken function from window (set by Clerk)
      // This approach requires that the component passes getToken or we get it from context
      const { getToken } = window.__clerk_frontend_api || {};

      if (!getToken) {
        // Fallback: try to import from the component that calls this
        throw new Error('getToken not available');
      }

      const authApi = createAuthenticatedApi(getToken);
      const response = await activityService.getJoinedActivities(authApi);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch joined activities'
      );
    }
  }
);

// Alternative thunk that accepts getToken as parameter
export const fetchJoinedActivities = createAsyncThunk(
  'userActivity/fetchJoinedActivities',
  async (getToken, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await activityService.getJoinedActivities(authApi);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch joined activities'
      );
    }
  }
);

// Thunk to fetch user's created activities
export const fetchMyCreatedActivities = createAsyncThunk(
  'userActivity/fetchMyCreatedActivities',
  async (getToken, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await activityService.getMyCreatedActivities(authApi);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch created activities'
      );
    }
  }
);

// Thunk to fetch a single activity by ID
export const getSingleActivity = createAsyncThunk(
  'userActivity/getSingleActivity',
  async ({ getToken, activityId }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await activityService.getActivityById(authApi, activityId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch activity'
      );
    }
  }
);

// Thunk to fetch participants of an activity
export const getParticipants = createAsyncThunk(
  'userActivity/getParticipants',
  async ({ getToken, activityId }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await activityService.getActivityParticipants(authApi, activityId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch participants'
      );
    }
  }
);

// Thunk to leave an activity
export const leaveActivity = createAsyncThunk(
  'userActivity/leaveActivity',
  async ({ getToken, activityId }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await activityService.leaveActivity(authApi, activityId);
      return { activityId, response };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to leave activity'
      );
    }
  }
);

// Thunk to delete an activity
export const deleteActivity = createAsyncThunk(
  'userActivity/deleteActivity',
  async ({ getToken, activityId }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await authApi.delete(`/activities/${activityId}`);
      return { activityId, response: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete activity'
      );
    }
  }
);

const userActivitySlice = createSlice({
  name: 'userActivity',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSingleActivity: (state) => {
      state.singleActivity = null;
      state.participants = [];
    },
    resetUserActivityState: (state) => {
      state.joinedActivities = [];
      state.createdActivities = [];
      state.singleActivity = null;
      state.participants = [];
      state.loading = false;
      state.createdLoading = false;
      state.singleLoading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Joined Activities (with getToken from window)
      .addCase(getJoinedActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getJoinedActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.joinedActivities = action.payload.data || [];
        state.error = null;
      })
      .addCase(getJoinedActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch joined activities';
      })

      // Fetch Joined Activities (with getToken as parameter)
      .addCase(fetchJoinedActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJoinedActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.joinedActivities = action.payload.data || [];
        state.error = null;
      })
      .addCase(fetchJoinedActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch joined activities';
      })

      // Fetch My Created Activities
      .addCase(fetchMyCreatedActivities.pending, (state) => {
        state.createdLoading = true;
        state.error = null;
      })
      .addCase(fetchMyCreatedActivities.fulfilled, (state, action) => {
        state.createdLoading = false;
        state.createdActivities = action.payload.data || [];
        state.error = null;
      })
      .addCase(fetchMyCreatedActivities.rejected, (state, action) => {
        state.createdLoading = false;
        state.error = action.payload || 'Failed to fetch created activities';
      })

      // Leave Activity
      .addCase(leaveActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(leaveActivity.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the activity from joinedActivities
        state.joinedActivities = state.joinedActivities.filter(
          (activity) => activity._id !== action.payload.activityId
        );
        state.error = null;
      })
      .addCase(leaveActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to leave activity';
      })

      // Delete Activity
      .addCase(deleteActivity.pending, (state) => {
        state.createdLoading = true;
        state.error = null;
      })
      .addCase(deleteActivity.fulfilled, (state, action) => {
        state.createdLoading = false;
        // Remove the activity from createdActivities
        state.createdActivities = state.createdActivities.filter(
          (activity) => activity._id !== action.payload.activityId
        );
        state.error = null;
      })
      .addCase(deleteActivity.rejected, (state, action) => {
        state.createdLoading = false;
        state.error = action.payload || 'Failed to delete activity';
      })

      // Get Single Activity
      .addCase(getSingleActivity.pending, (state) => {
        state.singleLoading = true;
        state.error = null;
      })
      .addCase(getSingleActivity.fulfilled, (state, action) => {
        state.singleLoading = false;
        state.singleActivity = action.payload.data || null;
        state.error = null;
      })
      .addCase(getSingleActivity.rejected, (state, action) => {
        state.singleLoading = false;
        state.error = action.payload || 'Failed to fetch activity';
      })

      // Get Participants
      .addCase(getParticipants.pending, (state) => {
        state.error = null;
      })
      .addCase(getParticipants.fulfilled, (state, action) => {
        state.participants = action.payload.data || [];
        state.error = null;
      })
      .addCase(getParticipants.rejected, (state, action) => {
        state.error = action.payload || 'Failed to fetch participants';
      });
  },
});

export const { clearError, clearSingleActivity, resetUserActivityState } = userActivitySlice.actions;
export default userActivitySlice.reducer;
