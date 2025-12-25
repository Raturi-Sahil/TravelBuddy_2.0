import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { createAuthenticatedApi, activityService } from '../services/api';

const initialState = {
  joinedActivities: [],
  loading: false,
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

const userActivitySlice = createSlice({
  name: 'userActivity',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetUserActivityState: (state) => {
      state.joinedActivities = [];
      state.loading = false;
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
      });
  },
});

export const { clearError, resetUserActivityState } = userActivitySlice.actions;
export default userActivitySlice.reducer;
