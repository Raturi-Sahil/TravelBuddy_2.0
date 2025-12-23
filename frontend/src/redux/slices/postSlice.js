import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { createAuthenticatedApi, postService } from '../services/api';

const initialState = {
  posts: [],
  myPosts: [],
  nearbyPosts: [],
  currentPost: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalPosts: 0,
    hasMore: false,
  },
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
};

// Create a new post
export const createPost = createAsyncThunk(
  'post/create',
  async ({ getToken, postData }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await postService.createPost(authApi, postData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create post'
      );
    }
  }
);

// Fetch posts with pagination
export const fetchPosts = createAsyncThunk(
  'post/fetchAll',
  async ({ getToken, page = 1, limit = 10, visibility, userId }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await postService.getPosts(authApi, { page, limit, visibility, userId });
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch posts'
      );
    }
  }
);

// Fetch user's own posts
export const fetchMyPosts = createAsyncThunk(
  'post/fetchMyPosts',
  async ({ getToken, page = 1, limit = 100 }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      // Use the dedicated endpoint for fetching only user's posts
      const response = await postService.getMyPosts(authApi, { page, limit });
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch your posts'
      );
    }
  }
);

// Fetch nearby posts
export const fetchNearbyPosts = createAsyncThunk(
  'post/fetchNearby',
  async ({ getToken, lat, lng, maxDistance }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await postService.getNearbyPosts(authApi, { lat, lng, maxDistance });
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch nearby posts'
      );
    }
  }
);

// Fetch posts by tags
export const fetchPostsByTags = createAsyncThunk(
  'post/fetchByTags',
  async ({ getToken, tags }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await postService.getPostsByTags(authApi, tags);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch posts by tags'
      );
    }
  }
);

// Fetch single post by ID
export const fetchPostById = createAsyncThunk(
  'post/fetchById',
  async ({ getToken, id }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await postService.getPostById(authApi, id);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch post'
      );
    }
  }
);

// Update post
export const updatePost = createAsyncThunk(
  'post/update',
  async ({ getToken, id, updateData }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await postService.updatePost(authApi, id, updateData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update post'
      );
    }
  }
);

// Delete post
export const deletePost = createAsyncThunk(
  'post/delete',
  async ({ getToken, id }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await postService.deletePost(authApi, id);
      return { id, response };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete post'
      );
    }
  }
);

// Toggle like on a post
export const toggleLike = createAsyncThunk(
  'post/toggleLike',
  async ({ getToken, id }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await postService.toggleLike(authApi, id);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to toggle like'
      );
    }
  }
);

// Add comment to a post
export const addComment = createAsyncThunk(
  'post/addComment',
  async ({ getToken, id, text }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await postService.addComment(authApi, id, text);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to add comment'
      );
    }
  }
);

// Delete comment from a post
export const deleteComment = createAsyncThunk(
  'post/deleteComment',
  async ({ getToken, postId, commentId }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await postService.deleteComment(authApi, postId, commentId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete comment'
      );
    }
  }
);

// Increment share count
export const incrementShare = createAsyncThunk(
  'post/incrementShare',
  async ({ getToken, id }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await postService.incrementShare(authApi, id);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to increment share'
      );
    }
  }
);

const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetPostState: (state) => {
      state.isCreating = false;
      state.isUpdating = false;
      state.isDeleting = false;
      state.error = null;
      state.currentPost = null;
    },
    // Optimistic update for like (optional)
    optimisticToggleLike: (state, action) => {
      const postId = action.payload;
      const updatePost = (post) => {
        if (post._id === postId) {
          post.likesCount = post.liked ? post.likesCount - 1 : post.likesCount + 1;
          post.liked = !post.liked;
        }
      };
      state.posts.forEach(updatePost);
      state.nearbyPosts.forEach(updatePost);
      state.myPosts.forEach(updatePost);
      if (state.currentPost?._id === postId) {
        updatePost(state.currentPost);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Post
      .addCase(createPost.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isCreating = false;
        state.currentPost = action.payload.data;
        state.myPosts.unshift(action.payload.data);
        state.posts.unshift(action.payload.data);
        state.error = null;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload || 'Failed to create post';
      })

      // Fetch Posts
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        const { posts, pagination } = action.payload.data;

        // If it's page 1, replace posts; otherwise, append
        if (pagination.currentPage === 1) {
          state.posts = posts;
        } else {
          state.posts = [...state.posts, ...posts];
        }

        state.pagination = pagination;
        state.error = null;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch posts';
      })

      // Fetch My Posts
      .addCase(fetchMyPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        const { posts, pagination } = action.payload.data;

        // Store in myPosts array
        state.myPosts = posts;
        state.pagination = pagination;
        state.error = null;
      })
      .addCase(fetchMyPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch your posts';
      })

      // Fetch Nearby Posts
      .addCase(fetchNearbyPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNearbyPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.nearbyPosts = action.payload.data;
        state.error = null;
      })
      .addCase(fetchNearbyPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch nearby posts';
      })

      // Fetch Posts by Tags
      .addCase(fetchPostsByTags.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPostsByTags.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload.data;
        state.error = null;
      })
      .addCase(fetchPostsByTags.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch posts by tags';
      })

      // Fetch Single Post
      .addCase(fetchPostById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPost = action.payload.data;
        state.error = null;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch post';
      })

      // Update Post
      .addCase(updatePost.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedPost = action.payload.data;

        // Update in all arrays
        const updateInArray = (arr) => {
          const index = arr.findIndex(p => p._id === updatedPost._id);
          if (index !== -1) arr[index] = updatedPost;
        };

        updateInArray(state.posts);
        updateInArray(state.myPosts);
        updateInArray(state.nearbyPosts);

        if (state.currentPost?._id === updatedPost._id) {
          state.currentPost = updatedPost;
        }

        state.error = null;
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload || 'Failed to update post';
      })

      // Delete Post
      .addCase(deletePost.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.isDeleting = false;
        const deletedId = action.payload.id;

        // Remove from all arrays
        state.posts = state.posts.filter(p => p._id !== deletedId);
        state.myPosts = state.myPosts.filter(p => p._id !== deletedId);
        state.nearbyPosts = state.nearbyPosts.filter(p => p._id !== deletedId);

        if (state.currentPost?._id === deletedId) {
          state.currentPost = null;
        }

        state.error = null;
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload || 'Failed to delete post';
      })

      // Toggle Like
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { post, liked } = action.payload.data;

        // Update in all arrays
        const updateInArray = (arr) => {
          const index = arr.findIndex(p => p._id === post._id);
          if (index !== -1) {
            arr[index] = { ...arr[index], ...post, liked };
          }
        };

        updateInArray(state.posts);
        updateInArray(state.myPosts);
        updateInArray(state.nearbyPosts);

        if (state.currentPost?._id === post._id) {
          state.currentPost = { ...state.currentPost, ...post, liked };
        }
      })

      // Add Comment
      .addCase(addComment.fulfilled, (state, action) => {
        const updatedPost = action.payload.data;

        // Update in all arrays
        const updateInArray = (arr) => {
          const index = arr.findIndex(p => p._id === updatedPost._id);
          if (index !== -1) arr[index] = updatedPost;
        };

        updateInArray(state.posts);
        updateInArray(state.myPosts);
        updateInArray(state.nearbyPosts);

        if (state.currentPost?._id === updatedPost._id) {
          state.currentPost = updatedPost;
        }
      })

      // Delete Comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        const updatedPost = action.payload.data;

        // Update in all arrays
        const updateInArray = (arr) => {
          const index = arr.findIndex(p => p._id === updatedPost._id);
          if (index !== -1) arr[index] = updatedPost;
        };

        updateInArray(state.posts);
        updateInArray(state.myPosts);
        updateInArray(state.nearbyPosts);

        if (state.currentPost?._id === updatedPost._id) {
          state.currentPost = updatedPost;
        }
      })

      // Increment Share
      .addCase(incrementShare.fulfilled, (state, action) => {
        const updatedPost = action.payload.data;

        // Update in all arrays
        const updateInArray = (arr) => {
          const index = arr.findIndex(p => p._id === updatedPost._id);
          if (index !== -1) arr[index] = updatedPost;
        };

        updateInArray(state.posts);
        updateInArray(state.myPosts);
        updateInArray(state.nearbyPosts);

        if (state.currentPost?._id === updatedPost._id) {
          state.currentPost = updatedPost;
        }
      });
  },
});

export const { clearError, resetPostState, optimisticToggleLike } = postSlice.actions;
export default postSlice.reducer;
