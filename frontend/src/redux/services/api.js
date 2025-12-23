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
  },

  getActivities: async (authApi) => {
    const response = await authApi.get('/activities');
    return response.data;
  },

  getActivityById: async (authApi, id) => {
    const response = await authApi.get(`/activities/${id}`);
    return response.data;
  },

  // Create payment order for joining activity
  createPaymentOrder: async (authApi, activityId) => {
    const response = await authApi.post(`/activities/${activityId}/payment`);
    return response.data;
  },

  // Verify payment and join activity
  verifyPayment: async (authApi, { orderId, activityId }) => {
    const response = await authApi.post('/activities/payment/verify', { orderId, activityId });
    return response.data;
  },

  // Join activity directly (for free activities or after payment)
  joinActivity: async (authApi, activityId) => {
    const response = await authApi.post(`/activities/${activityId}/join`);
    return response.data;
  },

  // Leave activity
  leaveActivity: async (authApi, activityId) => {
    const response = await authApi.post(`/activities/${activityId}/leave`);
    return response.data;
  }
};

// AI Service functions
export const aiService = {
  generateTripPlan: async (authApi, tripData) => {
    const response = await authApi.post('/ai/plan-trip', tripData);
    return response.data;
  },

  generateDescription: async (authApi, activityData) => {
    const response = await authApi.post('/ai/generate-description', activityData);
    return response.data;
  },

  generatePostCaption: async (authApi, postData) => {
    const response = await authApi.post('/ai/generate-post-caption', postData);
    return response.data;
  }
};

// Post Service functions
export const postService = {
  // Create a new post
  createPost: async (authApi, postData) => {
    const formData = new FormData();

    // Append images
    if (postData.images && postData.images.length > 0) {
      postData.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    // Append videos
    if (postData.videos && postData.videos.length > 0) {
      postData.videos.forEach((video) => {
        formData.append('videos', video);
      });
    }

    // Append other fields
    Object.keys(postData).forEach(key => {
      if (key !== 'images' && key !== 'videos') {
        const value = postData[key];
        if (value !== undefined && value !== null) {
          if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value);
          }
        }
      }
    });

    const response = await authApi.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get posts with pagination
  getPosts: async (authApi, { page = 1, limit = 10, visibility, userId } = {}) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (visibility) params.append('visibility', visibility);
    if (userId) params.append('userId', userId);

    const response = await authApi.get(`/posts?${params.toString()}`);
    return response.data;
  },

  // Get MY posts - posts created by authenticated user
  getMyPosts: async (authApi, { page = 1, limit = 100 } = {}) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);

    const response = await authApi.get(`/posts/my-posts?${params.toString()}`);
    return response.data;
  },

  // Get nearby posts
  getNearbyPosts: async (authApi, { lat, lng, maxDistance = 10000 } = {}) => {
    const params = new URLSearchParams();
    params.append('lat', lat);
    params.append('lng', lng);
    params.append('maxDistance', maxDistance);

    const response = await authApi.get(`/posts/nearby?${params.toString()}`);
    return response.data;
  },

  // Get posts by tags
  getPostsByTags: async (authApi, tags) => {
    const params = new URLSearchParams();
    params.append('tags', Array.isArray(tags) ? tags.join(',') : tags);

    const response = await authApi.get(`/posts/tags?${params.toString()}`);
    return response.data;
  },

  // Get single post by ID
  getPostById: async (authApi, id) => {
    const response = await authApi.get(`/posts/${id}`);
    return response.data;
  },

  // Update post
  updatePost: async (authApi, id, updateData) => {
    const response = await authApi.put(`/posts/${id}`, updateData);
    return response.data;
  },

  // Delete post
  deletePost: async (authApi, id) => {
    const response = await authApi.delete(`/posts/${id}`);
    return response.data;
  },

  // Toggle like on a post
  toggleLike: async (authApi, id) => {
    const response = await authApi.post(`/posts/${id}/like`);
    return response.data;
  },

  // Add comment to a post
  addComment: async (authApi, id, text) => {
    const response = await authApi.post(`/posts/${id}/comments`, { text });
    return response.data;
  },

  // Delete comment from a post
  deleteComment: async (authApi, postId, commentId) => {
    const response = await authApi.delete(`/posts/${postId}/comments/${commentId}`);
    return response.data;
  },

  // Increment share count
  incrementShare: async (authApi, id) => {
    const response = await authApi.post(`/posts/${id}/share`);
    return response.data;
  },
};

export default api;


