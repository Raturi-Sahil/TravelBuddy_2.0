import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { createAuthenticatedApi, transportService } from '../services/api';

// ==================== ASYNC THUNKS ====================

// Fetch all transports with filters
export const fetchTransports = createAsyncThunk(
  'transport/fetchTransports',
  async ({ getToken, filters }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await transportService.getTransports(authApi, filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transports');
    }
  }
);

// Fetch nearby transports
export const fetchNearbyTransports = createAsyncThunk(
  'transport/fetchNearbyTransports',
  async ({ getToken, lat, lng, maxDistance, limit }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await transportService.getNearbyTransports(authApi, { lat, lng, maxDistance, limit });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch nearby transports');
    }
  }
);

// Fetch transport by ID
export const fetchTransportById = createAsyncThunk(
  'transport/fetchTransportById',
  async ({ getToken, transportId }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await transportService.getTransportById(authApi, transportId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transport');
    }
  }
);

// Fetch my transport listings
export const fetchMyTransportListings = createAsyncThunk(
  'transport/fetchMyTransportListings',
  async ({ getToken }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await transportService.getMyTransportListings(authApi);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch my listings');
    }
  }
);

// Create transport listing
export const createTransportListing = createAsyncThunk(
  'transport/createTransportListing',
  async ({ getToken, listingData }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await transportService.createTransportListing(authApi, listingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create listing');
    }
  }
);

// Update transport listing
export const updateTransportListing = createAsyncThunk(
  'transport/updateTransportListing',
  async ({ getToken, transportId, listingData }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await transportService.updateTransportListing(authApi, transportId, listingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update listing');
    }
  }
);

// Toggle transport availability
export const toggleTransportAvailability = createAsyncThunk(
  'transport/toggleTransportAvailability',
  async ({ getToken, transportId }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await transportService.toggleTransportAvailability(authApi, transportId);
      return { transportId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle availability');
    }
  }
);

// Delete transport listing
export const deleteTransportListing = createAsyncThunk(
  'transport/deleteTransportListing',
  async ({ getToken, transportId }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      await transportService.deleteTransportListing(authApi, transportId);
      return transportId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete listing');
    }
  }
);

// Log contact
export const logTransportContact = createAsyncThunk(
  'transport/logContact',
  async ({ getToken, transportId, contactType }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      await transportService.logContact(authApi, transportId, contactType);
      return { transportId, contactType };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to log contact');
    }
  }
);

// Create review
export const createTransportReview = createAsyncThunk(
  'transport/createReview',
  async ({ getToken, transportId, reviewData }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await transportService.createReview(authApi, transportId, reviewData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create review');
    }
  }
);

// Fetch transport reviews
export const fetchTransportReviews = createAsyncThunk(
  'transport/fetchTransportReviews',
  async ({ getToken, transportId, page, limit }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await transportService.getTransportReviews(authApi, transportId, page, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
    }
  }
);

// ==================== INITIAL STATE ====================

const initialState = {
  // Browse transports
  transports: [],
  pagination: null,
  selectedTransport: null,

  // My listings
  myListings: [],

  // Reviews
  reviews: [],
  reviewsPagination: null,

  // Loading states
  loading: false,
  transportsLoading: false,
  myListingsLoading: false,
  reviewsLoading: false,
  createLoading: false,

  // Errors
  error: null,

  // Success flags
  createSuccess: false,
};

// ==================== SLICE ====================

const transportSlice = createSlice({
  name: 'transport',
  initialState,
  reducers: {
    clearTransportError: (state) => {
      state.error = null;
    },
    clearSelectedTransport: (state) => {
      state.selectedTransport = null;
    },
    clearReviews: (state) => {
      state.reviews = [];
      state.reviewsPagination = null;
    },
    clearCreateSuccess: (state) => {
      state.createSuccess = false;
    },
    resetTransportState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch transports
      .addCase(fetchTransports.pending, (state) => {
        state.transportsLoading = true;
        state.error = null;
      })
      .addCase(fetchTransports.fulfilled, (state, action) => {
        state.transportsLoading = false;
        state.transports = action.payload.transports;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTransports.rejected, (state, action) => {
        state.transportsLoading = false;
        state.error = action.payload;
      })

      // Fetch nearby transports
      .addCase(fetchNearbyTransports.pending, (state) => {
        state.transportsLoading = true;
        state.error = null;
      })
      .addCase(fetchNearbyTransports.fulfilled, (state, action) => {
        state.transportsLoading = false;
        state.transports = action.payload;
      })
      .addCase(fetchNearbyTransports.rejected, (state, action) => {
        state.transportsLoading = false;
        state.error = action.payload;
      })

      // Fetch transport by ID
      .addCase(fetchTransportById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransportById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTransport = action.payload;
      })
      .addCase(fetchTransportById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch my listings
      .addCase(fetchMyTransportListings.pending, (state) => {
        state.myListingsLoading = true;
        state.error = null;
      })
      .addCase(fetchMyTransportListings.fulfilled, (state, action) => {
        state.myListingsLoading = false;
        state.myListings = action.payload;
      })
      .addCase(fetchMyTransportListings.rejected, (state, action) => {
        state.myListingsLoading = false;
        state.error = action.payload;
      })

      // Create listing
      .addCase(createTransportListing.pending, (state) => {
        state.createLoading = true;
        state.error = null;
        state.createSuccess = false;
      })
      .addCase(createTransportListing.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createSuccess = true;
        state.myListings.unshift(action.payload);
      })
      .addCase(createTransportListing.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
        state.createSuccess = false;
      })

      // Update listing
      .addCase(updateTransportListing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTransportListing.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.myListings.findIndex(l => l._id === action.payload._id);
        if (index !== -1) {
          state.myListings[index] = action.payload;
        }
        if (state.selectedTransport?._id === action.payload._id) {
          state.selectedTransport = action.payload;
        }
      })
      .addCase(updateTransportListing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Toggle availability
      .addCase(toggleTransportAvailability.fulfilled, (state, action) => {
        const index = state.myListings.findIndex(l => l._id === action.payload.transportId);
        if (index !== -1) {
          state.myListings[index].isAvailable = action.payload.isAvailable;
        }
      })

      // Delete listing
      .addCase(deleteTransportListing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTransportListing.fulfilled, (state, action) => {
        state.loading = false;
        state.myListings = state.myListings.filter(l => l._id !== action.payload);
      })
      .addCase(deleteTransportListing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create review
      .addCase(createTransportReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransportReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews.unshift(action.payload);
      })
      .addCase(createTransportReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch reviews
      .addCase(fetchTransportReviews.pending, (state) => {
        state.reviewsLoading = true;
        state.error = null;
      })
      .addCase(fetchTransportReviews.fulfilled, (state, action) => {
        state.reviewsLoading = false;
        state.reviews = action.payload.reviews;
        state.reviewsPagination = action.payload.pagination;
      })
      .addCase(fetchTransportReviews.rejected, (state, action) => {
        state.reviewsLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearTransportError,
  clearSelectedTransport,
  clearReviews,
  clearCreateSuccess,
  resetTransportState
} = transportSlice.actions;

export default transportSlice.reducer;
