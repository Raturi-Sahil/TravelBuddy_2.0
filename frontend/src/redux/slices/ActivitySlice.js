import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { createAuthenticatedApi, activityService } from '../services/api';

const initialState = {
  activities: [],
  myActivities: [],
  currentActivity: null,
  isLoading: false,
  isCreating: false,
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
      });
  },
});

export const { clearError, resetActivityState } = activitySlice.actions;
export default activitySlice.reducer;
