import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { createAuthenticatedApi, guideService } from '../services/api';

// Async thunks for guide operations
export const fetchGuides = createAsyncThunk(
  'guide/fetchGuides',
  async ({ getToken, filters }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await guideService.getGuides(authApi, filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch guides');
    }
  }
);

export const fetchNearbyGuides = createAsyncThunk(
  'guide/fetchNearbyGuides',
  async ({ getToken, lat, lng, radius, filters = {} }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await guideService.getNearbyGuides(authApi, { 
        lat, 
        lng, 
        radius, 
        specialty: filters.specialty,
        minRating: filters.minRating,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        sortBy: filters.sortBy,
        page: filters.page,
        limit: filters.limit,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch nearby guides');
    }
  }
);

export const fetchGuideById = createAsyncThunk(
  'guide/fetchGuideById',
  async ({ getToken, guideId }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await guideService.getGuideById(authApi, guideId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch guide');
    }
  }
);

export const fetchMyGuideProfile = createAsyncThunk(
  'guide/fetchMyGuideProfile',
  async ({ getToken }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await guideService.getMyGuideProfile(authApi);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch guide profile');
    }
  }
);

export const createGuideProfile = createAsyncThunk(
  'guide/createGuideProfile',
  async ({ getToken, profileData }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await guideService.createGuideProfile(authApi, profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create guide profile');
    }
  }
);

export const updateGuideProfile = createAsyncThunk(
  'guide/updateGuideProfile',
  async ({ getToken, profileData }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await guideService.updateGuideProfile(authApi, profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update guide profile');
    }
  }
);

export const toggleGuideStatus = createAsyncThunk(
  'guide/toggleGuideStatus',
  async ({ getToken }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await guideService.toggleGuideStatus(authApi);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle guide status');
    }
  }
);

// Booking thunks
export const createBooking = createAsyncThunk(
  'guide/createBooking',
  async ({ getToken, bookingData }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await guideService.createBooking(authApi, bookingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create booking');
    }
  }
);

export const fetchMyBookingsAsTraveler = createAsyncThunk(
  'guide/fetchMyBookingsAsTraveler',
  async ({ getToken, status }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await guideService.getMyBookingsAsTraveler(authApi, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
    }
  }
);

export const fetchMyBookingsAsGuide = createAsyncThunk(
  'guide/fetchMyBookingsAsGuide',
  async ({ getToken, status }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await guideService.getMyBookingsAsGuide(authApi, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch guide bookings');
    }
  }
);

export const confirmBooking = createAsyncThunk(
  'guide/confirmBooking',
  async ({ getToken, bookingId }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await guideService.confirmBooking(authApi, bookingId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to confirm booking');
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'guide/cancelBooking',
  async ({ getToken, bookingId, reason }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await guideService.cancelBooking(authApi, bookingId, reason);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel booking');
    }
  }
);

export const completeBooking = createAsyncThunk(
  'guide/completeBooking',
  async ({ getToken, bookingId }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await guideService.completeBooking(authApi, bookingId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete booking');
    }
  }
);

// Review thunks
export const createReview = createAsyncThunk(
  'guide/createReview',
  async ({ getToken, guideId, reviewData }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await guideService.createReview(authApi, guideId, reviewData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create review');
    }
  }
);

export const fetchGuideReviews = createAsyncThunk(
  'guide/fetchGuideReviews',
  async ({ getToken, guideId, page, limit }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await guideService.getGuideReviews(authApi, guideId, page, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
    }
  }
);

// Payment thunks
export const createGuideBookingPayment = createAsyncThunk(
  'guide/createGuideBookingPayment',
  async ({ getToken, bookingId }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await guideService.createGuideBookingPayment(authApi, bookingId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create payment order');
    }
  }
);

export const verifyGuideBookingPayment = createAsyncThunk(
  'guide/verifyGuideBookingPayment',
  async ({ getToken, bookingId, orderId }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await guideService.verifyGuideBookingPayment(authApi, bookingId, orderId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify payment');
    }
  }
);

const initialState = {
  // Browse guides
  guides: [],
  pagination: null,
  selectedGuide: null,
  
  // My guide profile
  myGuideProfile: null,
  
  // Bookings
  travelerBookings: [],
  guideBookings: [],
  
  // Reviews
  reviews: [],
  reviewsPagination: null,
  
  // Loading states
  loading: false,
  guidesLoading: false,
  bookingsLoading: false,
  reviewsLoading: false,
  paymentLoading: false,
  
  // Errors
  error: null,
};

const guideSlice = createSlice({
  name: 'guide',
  initialState,
  reducers: {
    clearGuideError: (state) => {
      state.error = null;
    },
    clearSelectedGuide: (state) => {
      state.selectedGuide = null;
    },
    clearReviews: (state) => {
      state.reviews = [];
      state.reviewsPagination = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch guides
      .addCase(fetchGuides.pending, (state) => {
        state.guidesLoading = true;
        state.error = null;
      })
      .addCase(fetchGuides.fulfilled, (state, action) => {
        state.guidesLoading = false;
        state.guides = action.payload.guides;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchGuides.rejected, (state, action) => {
        state.guidesLoading = false;
        state.error = action.payload;
      })
      
      // Fetch nearby guides
      .addCase(fetchNearbyGuides.pending, (state) => {
        state.guidesLoading = true;
        state.error = null;
      })
      .addCase(fetchNearbyGuides.fulfilled, (state, action) => {
        state.guidesLoading = false;
        state.guides = action.payload.guides;
        state.pagination = action.payload.pagination || null;
      })
      .addCase(fetchNearbyGuides.rejected, (state, action) => {
        state.guidesLoading = false;
        state.error = action.payload;
      })
      
      // Fetch guide by ID
      .addCase(fetchGuideById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGuideById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedGuide = action.payload;
      })
      .addCase(fetchGuideById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch my guide profile
      .addCase(fetchMyGuideProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyGuideProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.myGuideProfile = action.payload;
      })
      .addCase(fetchMyGuideProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create guide profile
      .addCase(createGuideProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGuideProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.myGuideProfile = action.payload;
      })
      .addCase(createGuideProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update guide profile
      .addCase(updateGuideProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGuideProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.myGuideProfile = action.payload;
      })
      .addCase(updateGuideProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Toggle guide status
      .addCase(toggleGuideStatus.fulfilled, (state, action) => {
        if (state.myGuideProfile) {
          state.myGuideProfile.isActive = action.payload.isActive;
        }
      })
      
      // Create booking
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.travelerBookings.unshift(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch traveler bookings
      .addCase(fetchMyBookingsAsTraveler.pending, (state) => {
        state.bookingsLoading = true;
        state.error = null;
      })
      .addCase(fetchMyBookingsAsTraveler.fulfilled, (state, action) => {
        state.bookingsLoading = false;
        state.travelerBookings = action.payload;
      })
      .addCase(fetchMyBookingsAsTraveler.rejected, (state, action) => {
        state.bookingsLoading = false;
        state.error = action.payload;
      })
      
      // Fetch guide bookings
      .addCase(fetchMyBookingsAsGuide.pending, (state) => {
        state.bookingsLoading = true;
        state.error = null;
      })
      .addCase(fetchMyBookingsAsGuide.fulfilled, (state, action) => {
        state.bookingsLoading = false;
        state.guideBookings = action.payload;
      })
      .addCase(fetchMyBookingsAsGuide.rejected, (state, action) => {
        state.bookingsLoading = false;
        state.error = action.payload;
      })
      
      // Confirm booking
      .addCase(confirmBooking.fulfilled, (state, action) => {
        const index = state.guideBookings.findIndex(b => b._id === action.payload._id);
        if (index !== -1) {
          state.guideBookings[index] = action.payload;
        }
      })
      
      // Cancel booking
      .addCase(cancelBooking.fulfilled, (state, action) => {
        // Update in traveler bookings
        const travelerIndex = state.travelerBookings.findIndex(b => b._id === action.payload._id);
        if (travelerIndex !== -1) {
          state.travelerBookings[travelerIndex] = action.payload;
        }
        // Update in guide bookings
        const guideIndex = state.guideBookings.findIndex(b => b._id === action.payload._id);
        if (guideIndex !== -1) {
          state.guideBookings[guideIndex] = action.payload;
        }
      })
      
      // Complete booking
      .addCase(completeBooking.fulfilled, (state, action) => {
        const index = state.guideBookings.findIndex(b => b._id === action.payload._id);
        if (index !== -1) {
          state.guideBookings[index] = action.payload;
        }
      })
      
      // Create review
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews.unshift(action.payload);
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch reviews
      .addCase(fetchGuideReviews.pending, (state) => {
        state.reviewsLoading = true;
        state.error = null;
      })
      .addCase(fetchGuideReviews.fulfilled, (state, action) => {
        state.reviewsLoading = false;
        state.reviews = action.payload.reviews;
        state.reviewsPagination = action.payload.pagination;
      })
      .addCase(fetchGuideReviews.rejected, (state, action) => {
        state.reviewsLoading = false;
        state.error = action.payload;
      })
      
      // Create guide booking payment
      .addCase(createGuideBookingPayment.pending, (state) => {
        state.paymentLoading = true;
        state.error = null;
      })
      .addCase(createGuideBookingPayment.fulfilled, (state) => {
        state.paymentLoading = false;
      })
      .addCase(createGuideBookingPayment.rejected, (state, action) => {
        state.paymentLoading = false;
        state.error = action.payload;
      })
      
      // Verify guide booking payment
      .addCase(verifyGuideBookingPayment.pending, (state) => {
        state.paymentLoading = true;
        state.error = null;
      })
      .addCase(verifyGuideBookingPayment.fulfilled, (state, action) => {
        state.paymentLoading = false;
        // Update booking in travelerBookings
        if (action.payload.booking) {
          const index = state.travelerBookings.findIndex(b => b._id === action.payload.booking._id);
          if (index !== -1) {
            state.travelerBookings[index] = action.payload.booking;
          }
        }
      })
      .addCase(verifyGuideBookingPayment.rejected, (state, action) => {
        state.paymentLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearGuideError, clearSelectedGuide, clearReviews } = guideSlice.actions;
export default guideSlice.reducer;
