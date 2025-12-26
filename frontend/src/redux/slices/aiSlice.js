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

export const generatePostCaption = createAsyncThunk(
  'ai/generatePostCaption',
  async ({ getToken, postData }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await aiService.generatePostCaption(authApi, postData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to generate post caption'
      );
    }
  }
);

export const generatePackingList = createAsyncThunk(
  'ai/generatePackingList',
  async ({ getToken, packingData }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await aiService.generatePackingList(authApi, packingData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to generate packing list'
      );
    }
  }
);

export const generateWeatherForecast = createAsyncThunk(
  'ai/generateWeatherForecast',
  async ({ getToken, weatherData }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await aiService.generateWeatherForecast(authApi, weatherData);
      return response;
    } catch (error) {
       return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to generate weather forecast'
      );
    }
  }
);

// AI slice
const aiSlice = createSlice({
  name: 'ai',
  initialState: {
    ...initialState,
    packingList: null,
    weatherData: null,
  },
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
    clearPackingList: (state) => {
      state.packingList = null;
    },
    clearWeatherForecast: (state) => {
      state.weatherData = null;
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
      })
      // Generate Post Caption
      .addCase(generatePostCaption.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(generatePostCaption.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.description = action.payload.data;
        state.error = null;
      })
      .addCase(generatePostCaption.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.payload || 'Failed to generate post caption';
      })
      // Generate Packing List
      .addCase(generatePackingList.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(generatePackingList.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.packingList = action.payload.data;
        state.error = null;
      })
      .addCase(generatePackingList.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.payload || 'Failed to generate packing list';
      })
      // Generate Weather Forecast
      .addCase(generateWeatherForecast.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(generateWeatherForecast.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.weatherData = action.payload.data;
        state.error = null;
      })
      .addCase(generateWeatherForecast.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.payload || 'Failed to generate weather forecast';
      });
  },
});

export const { clearError, clearTripPlan, clearDescription, clearPackingList, clearWeatherForecast } = aiSlice.actions;
export default aiSlice.reducer;
