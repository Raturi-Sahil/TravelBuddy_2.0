import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { aiService, createAuthenticatedApi } from '../services/api';

// Initial state
const initialState = {
  tripPlan: null,
  description: null,
  isGenerating: false,
  error: null,
};

// Async thunks
export const generateTripPlan = createAsyncThunk(
  'ai/generateTripPlan',
  async ({ getToken, tripData }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await aiService.generateTripPlan(authApi, tripData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to generate trip plan'
      );
    }
  }
);

export const generateDescription = createAsyncThunk(
  'ai/generateDescription',
  async ({ getToken, activityData }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await aiService.generateDescription(authApi, activityData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to generate description'
      );
    }
  }
);

// AI slice
const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTripPlan: (state) => {
      state.tripPlan = null;
    },
    clearDescription: (state) => {
      state.description = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Generate Trip Plan
      .addCase(generateTripPlan.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(generateTripPlan.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.tripPlan = action.payload.data;
        state.error = null;
      })
      .addCase(generateTripPlan.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.payload || 'Failed to generate trip plan';
      })
      // Generate Description
      .addCase(generateDescription.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(generateDescription.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.description = action.payload.data;
        state.error = null;
      })
      .addCase(generateDescription.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.payload || 'Failed to generate description';
      });
  },
});

export const { clearError, clearTripPlan, clearDescription } = aiSlice.actions;
export default aiSlice.reducer;
