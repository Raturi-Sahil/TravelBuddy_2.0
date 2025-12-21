import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL ;

// Create base axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Function to create authenticated axios instance with Clerk token
export const createAuthenticatedApi = (getToken) => {
  const authApi = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
  });

  // Add request interceptor to include auth token
  authApi.interceptors.request.use(
    async (config) => {
      try {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error getting auth token:', error);
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  return authApi;
};

// User API service functions
export const userService = {
  register: async (authApi, userData) => {
    const response = await authApi.post('/users/register', userData);
    return response.data;
  },

  getProfile: async (authApi) => {
    const response = await authApi.get('/users/profile');
    return response.data;
  },

  updateProfile: async (authApi, profileData) => {
    // Check if we have any image files to upload
    const hasCoverImage = profileData.coverImageFile;
    const hasProfileImage = profileData.profileImageFile;

    if (hasCoverImage || hasProfileImage) {
      const formData = new FormData();
      // Append image files if present
      if (hasCoverImage) {
        formData.append('coverImage', profileData.coverImageFile);
      }
      if (hasProfileImage) {
        formData.append('profileImage', profileData.profileImageFile);
      }
      // Append other fields to FormData
      Object.keys(profileData).forEach(key => {
        if (key !== 'coverImageFile' && key !== 'profileImageFile') {
          const value = profileData[key];
          if (value !== undefined && value !== null) {
            // Handle objects/arrays by stringifying them
            if (typeof value === 'object') {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, value);
            }
          }
        }
      });

      const response = await authApi.patch('/users/update-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }

    // No file upload, send as JSON
    const response = await authApi.patch('/users/update-profile', profileData);
    return response.data;
  },

  buySubscription: async (authApi, subscriptionData) => {
    const response = await authApi.post('/subscription/create-order', subscriptionData);
    return response.data;
  },

  verifyPayment: async (authApi, orderId) => {
    const response = await authApi.post('/subscription/verify-payment', { orderId });
    return response.data;
  },

  getNearbyTravelers: async (authApi, { lat, lng, radius = 20000, search = '', page = 1, limit = 50 } = {}) => {
    const params = new URLSearchParams();
    if (lat !== undefined && lat !== null) params.append('lat', lat);
    if (lng !== undefined && lng !== null) params.append('lng', lng);
    if (radius) params.append('radius', radius);
    if (search) params.append('search', search);
    params.append('page', page);
    params.append('limit', limit);

    const response = await authApi.get(`/users/nearby?${params.toString()}`);
    return response.data;
  },

  // Get another user's profile by ID
  getUserById: async (authApi, id) => {
    const response = await authApi.get(`/users/${id}`);
    return response.data;
  },

  // Friend management
  sendFriendRequest: async (authApi, id) => {
    const response = await authApi.post(`/friends/request/${id}`);
    return response.data;
  },

  acceptFriendRequest: async (authApi, id) => {
    const response = await authApi.post(`/friends/accept/${id}`);
    return response.data;
  },

  rejectFriendRequest: async (authApi, id) => {
    const response = await authApi.post(`/friends/reject/${id}`);
    return response.data;
  },

  removeFriend: async (authApi, id) => {
    const response = await authApi.delete(`/friends/remove/${id}`);
    return response.data;
  },

  getFriends: async (authApi) => {
    const response = await authApi.get('/friends');
    return response.data;
  },

  getFriendRequests: async (authApi) => {
    const response = await authApi.get('/friends/requests');
    return response.data;
  },
};

// Places API service functions (no auth required for public data)
export const placesService = {
  getNearbyHotels: async ({ lat, lng, radius = 20000, search = '', pageToken = '' } = {}) => {
    const params = new URLSearchParams();
    params.append('lat', lat);
    params.append('lng', lng);
    params.append('radius', radius);
    if (search) params.append('search', search);
    if (pageToken) params.append('pageToken', pageToken);

    const response = await api.get(`/places/hotels?${params.toString()}`);
    return response.data;
  },

  getNearbyTouristPlaces: async ({ lat, lng, radius = 20000, search = '', pageToken = '' } = {}) => {
    const params = new URLSearchParams();
    params.append('lat', lat);
    params.append('lng', lng);
    params.append('radius', radius);
    if (search) params.append('search', search);
    if (pageToken) params.append('pageToken', pageToken);

    const response = await api.get(`/places/tourist?${params.toString()}`);
    return response.data;
  },

  getNearbyRestaurants: async ({ lat, lng, radius = 20000, search = '', pageToken = '' } = {}) => {
    const params = new URLSearchParams();
    params.append('lat', lat);
    params.append('lng', lng);
    params.append('radius', radius);
    if (search) params.append('search', search);
    if (pageToken) params.append('pageToken', pageToken);

    const response = await api.get(`/places/restaurants?${params.toString()}`);
    return response.data;
  },

  getNearbyShopping: async ({ lat, lng, radius = 20000, search = '', pageToken = '' } = {}) => {
    const params = new URLSearchParams();
    params.append('lat', lat);
    params.append('lng', lng);
    params.append('radius', radius);
    if (search) params.append('search', search);
    if (pageToken) params.append('pageToken', pageToken);

    const response = await api.get(`/places/shopping?${params.toString()}`);
    return response.data;
  },

  getNearbyEmergency: async ({ lat, lng, radius = 20000, search = '', pageToken = '' } = {}) => {
    const params = new URLSearchParams();
    params.append('lat', lat);
    params.append('lng', lng);
    params.append('radius', radius);
    if (search) params.append('search', search);
    if (pageToken) params.append('pageToken', pageToken);

    const response = await api.get(`/places/emergency?${params.toString()}`);
    return response.data;
  },

  getNearbyTransport: async ({ lat, lng, radius = 20000, search = '', pageToken = '' } = {}) => {
    const params = new URLSearchParams();
    params.append('lat', lat);
    params.append('lng', lng);
    params.append('radius', radius);
    if (search) params.append('search', search);
    if (pageToken) params.append('pageToken', pageToken);

    const response = await api.get(`/places/transport?${params.toString()}`);
    return response.data;
  },
};

export const activityService = {
  createActivity: async (authApi, activityData) => {
    let formData;

    if (activityData instanceof FormData) {
      formData = activityData;
    } else {
      formData = new FormData();

      // Append photos
      if (activityData.photos && activityData.photos.length > 0) {
        if (typeof activityData.photos[0] === 'string') {
            // If already uploaded urls
             activityData.photos.forEach((photo) => {
               formData.append('photos', photo);
             });
        } else {
          // File objects
          activityData.photos.forEach((photo) => {
            formData.append('photos', photo);
          });
        }
      }

      // Append other fields
      Object.keys(activityData).forEach(key => {
        if (key !== 'photos') {
           // Handle arrays like videos
           if (Array.isArray(activityData[key])) {
             activityData[key].forEach(val => formData.append(key, val));
           } else {
             formData.append(key, activityData[key]);
           }
        }
      });
    }

    const response = await authApi.post('/activities', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

export default api;

