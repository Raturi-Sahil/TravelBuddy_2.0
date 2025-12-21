import { createAsyncThunk,createSlice } from '@reduxjs/toolkit';

import { createAuthenticatedApi,userService } from '../services/api';

// Initial state
const initialState = {
  profile: null,
  isLoading: false,
  isRegistering: false,
  isUpdating: false,
  error: null,
  errorStatus: null, // HTTP status code for redirect logic
  isRegistered: false,
};

// Async thunks
export const registerUser = createAsyncThunk(
  'user/register',
  async ({ getToken, clerkUser, additionalData }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      // Extract name, email, and profile image URL from Clerk user
      const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Anonymous';
      const email = clerkUser.primaryEmailAddress?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress;
      const profileImageUrl = clerkUser.imageUrl || '';
      
      const userData = {
        clerk_id: clerkUser.id,
        name,
        email,
        profileImageUrl,
        ...additionalData,
      };
      const response = await userService.register(authApi, userData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Registration failed'
      );
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'user/fetchProfile',
  async ({ getToken }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await userService.getProfile(authApi);
      console.log('response', response);
      return response;
    } catch (error) {
      return rejectWithValue({
        status: error.response?.status,
        message: error.response?.data?.message || error.message || 'Failed to fetch profile'
      });
    }
  }
);

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async ({ getToken, profileData }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await userService.updateProfile(authApi, profileData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update profile'
      );
    }
  }
);
export const buySubscription = createAsyncThunk(
  'user/buySubscription',
  async({getToken, amount,planType},{rejectWithValue}) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await userService.buySubscription(authApi, {amount,planType});
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message || 'Failed to buy subscription' }
      );
    }
  }
);

export const verifySubscription = createAsyncThunk(
  'user/verifySubscription',
  async({getToken, orderId},{rejectWithValue}) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await userService.verifyPayment(authApi, orderId);
      return response;
    } catch (error) {
      return rejectWithValue(
         error.response?.data || { message: error.message || 'Failed to verify subscription' }
      );
    }
  }
);

// User slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearProfile: (state) => {
      state.profile = null;
      state.isRegistered = false;
    },
    setProfile: (state, action) => {
      state.profile = action.payload;
      state.isRegistered = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register User
      .addCase(registerUser.pending, (state) => {
        state.isRegistering = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isRegistering = false;
        state.profile = action.payload.data;
        state.isRegistered = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isRegistering = false;
        state.error = action.payload?.message || action.payload || 'Registration failed';
      })
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.data;
        state.isRegistered = true;
        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || action.payload || 'Failed to fetch profile';
        state.errorStatus = action.payload?.status || null;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.profile = action.payload.data;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload?.message || action.payload || 'Failed to update profile';
      })
      .addCase(buySubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(buySubscription.fulfilled, (state) => {
        state.isLoading = false;
        // buySubscription just creates order, doesn't update profile yet
        state.error = null;
      })
      .addCase(buySubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || action.payload || 'Failed to buy subscription';
        state.errorStatus = action.payload?.status || null;
      })
      .addCase(verifySubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifySubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.user; // Backend returns { user, payment, ... }
        state.error = null;
      })
      .addCase(verifySubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || action.payload || 'Failed to verify subscription';
        state.errorStatus = action.payload?.status || null;
      })
  },
});

export const { clearError, clearProfile, setProfile } = userSlice.actions;
export default userSlice.reducer;
