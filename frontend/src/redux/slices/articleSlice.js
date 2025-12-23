import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { createAuthenticatedApi } from '../services/api';

// Article service
const articleService = {
  // Create article
  createArticle: async (api, articleData) => {
    const response = await api.post('/articles', articleData);
    return response.data;
  },

  // Get all articles
  getArticles: async (api, params = {}) => {
    const response = await api.get('/articles', { params });
    return response.data;
  },

  // Get user's articles
  getMyArticles: async (api, params = {}) => {
    const response = await api.get('/articles/my-articles', { params });
    return response.data;
  },

  // Get article by ID
  getArticleById: async (api, id) => {
    const response = await api.get(`/articles/${id}`);
    return response.data;
  },

  // Update article
  updateArticle: async (api, id, updateData) => {
    const response = await api.put(`/articles/${id}`, updateData);
    return response.data;
  },

  // Delete article
  deleteArticle: async (api, id) => {
    const response = await api.delete(`/articles/${id}`);
    return response.data;
  },

  // Toggle like on article
  toggleLike: async (api, id) => {
    const response = await api.post(`/articles/${id}/like`);
    return response.data;
  },

  // Add comment to article
  addComment: async (api, id, commentData) => {
    const response = await api.post(`/articles/${id}/comments`, commentData);
    return response.data;
  },

  // Delete comment
  deleteComment: async (api, articleId, commentId) => {
    const response = await api.delete(`/articles/${articleId}/comments/${commentId}`);
    return response.data;
  },

  // Increment share count
  incrementShare: async (api, id) => {
    const response = await api.post(`/articles/${id}/share`);
    return response.data;
  }
};

const initialState = {
  articles: [],
  myArticles: [],
  currentArticle: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalArticles: 0,
    hasMore: false,
  },
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
};

// Create a new article
export const createArticle = createAsyncThunk(
  'article/create',
  async ({ getToken, articleData }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await articleService.createArticle(authApi, articleData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create article'
      );
    }
  }
);

// Fetch all articles with pagination
export const fetchArticles = createAsyncThunk(
  'article/fetchAll',
  async ({ getToken, page = 1, limit = 10, category, visibility, userId }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await articleService.getArticles(authApi, { page, limit, category, visibility, userId });
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch articles'
      );
    }
  }
);

// Fetch user's own articles
export const fetchMyArticles = createAsyncThunk(
  'article/fetchMyArticles',
  async ({ getToken, page = 1, limit = 100 }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await articleService.getMyArticles(authApi, { page, limit });
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch your articles'
      );
    }
  }
);

// Fetch single article by ID
export const fetchArticleById = createAsyncThunk(
  'article/fetchById',
  async ({ getToken, id }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await articleService.getArticleById(authApi, id);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch article'
      );
    }
  }
);

// Update article
export const updateArticle = createAsyncThunk(
  'article/update',
  async ({ getToken, id, updateData }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await articleService.updateArticle(authApi, id, updateData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update article'
      );
    }
  }
);

// Delete article
export const deleteArticle = createAsyncThunk(
  'article/delete',
  async ({ getToken, id }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await articleService.deleteArticle(authApi, id);
      return { id, response };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete article'
      );
    }
  }
);

// Toggle like on article
export const toggleArticleLike = createAsyncThunk(
  'article/toggleLike',
  async ({ getToken, id }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await articleService.toggleLike(authApi, id);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to toggle like'
      );
    }
  }
);

// Add comment to article
export const addArticleComment = createAsyncThunk(
  'article/addComment',
  async ({ getToken, id, commentData }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await articleService.addComment(authApi, id, commentData);
      return { id, comment: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to add comment'
      );
    }
  }
);

// Delete comment from article
export const deleteArticleComment = createAsyncThunk(
  'article/deleteComment',
  async ({ getToken, articleId, commentId }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await articleService.deleteComment(authApi, articleId, commentId);
      return { articleId, commentId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete comment'
      );
    }
  }
);

// Increment share count
export const incrementArticleShare = createAsyncThunk(
  'article/incrementShare',
  async ({ getToken, id }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await articleService.incrementShare(authApi, id);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to increment share'
      );
    }
  }
);

const articleSlice = createSlice({
  name: 'article',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetArticleState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Create Article
      .addCase(createArticle.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createArticle.fulfilled, (state, action) => {
        state.isCreating = false;
        state.currentArticle = action.payload.data;
        state.myArticles.unshift(action.payload.data);
        state.articles.unshift(action.payload.data);
        state.error = null;
      })
      .addCase(createArticle.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload || 'Failed to create article';
      })

      // Fetch Articles
      .addCase(fetchArticles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.isLoading = false;
        const { articles, pagination } = action.payload.data;

        // If it's page 1, replace articles; otherwise, append
        if (pagination.currentPage === 1) {
          state.articles = articles;
        } else {
          state.articles = [...state.articles, ...articles];
        }

        state.pagination = pagination;
        state.error = null;
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch articles';
      })

      // Fetch My Articles
      .addCase(fetchMyArticles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyArticles.fulfilled, (state, action) => {
        state.isLoading = false;
        const { articles, pagination } = action.payload.data;

        // Store in myArticles array
        state.myArticles = articles;
        state.pagination = pagination;
        state.error = null;
      })
      .addCase(fetchMyArticles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch your articles';
      })

      // Fetch Article By ID
      .addCase(fetchArticleById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchArticleById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentArticle = action.payload.data;
        state.error = null;
      })
      .addCase(fetchArticleById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch article';
      })

      // Update Article
      .addCase(updateArticle.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateArticle.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedArticle = action.payload.data;

        // Update in articles array
        state.articles = state.articles.map(article =>
          article._id === updatedArticle._id ? updatedArticle : article
        );

        // Update in myArticles array
        state.myArticles = state.myArticles.map(article =>
          article._id === updatedArticle._id ? updatedArticle : article
        );

        // Update currentArticle if it's the same
        if (state.currentArticle?._id === updatedArticle._id) {
          state.currentArticle = updatedArticle;
        }

        state.error = null;
      })
      .addCase(updateArticle.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload || 'Failed to update article';
      })

      // Delete Article
      .addCase(deleteArticle.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteArticle.fulfilled, (state, action) => {
        state.isDeleting = false;
        const deletedId = action.payload.id;

        // Remove from all arrays
        state.articles = state.articles.filter(a => a._id !== deletedId);
        state.myArticles = state.myArticles.filter(a => a._id !== deletedId);

        if (state.currentArticle?._id === deletedId) {
          state.currentArticle = null;
        }

        state.error = null;
      })
      .addCase(deleteArticle.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload || 'Failed to delete article';
      })

      // Toggle Like
      .addCase(toggleArticleLike.fulfilled, (state, action) => {
        const { id, data } = action.payload;

        // Update in articles array
        state.articles = state.articles.map(article =>
          article._id === id ? { ...article, ...data } : article
        );

        // Update in myArticles array
        state.myArticles = state.myArticles.map(article =>
          article._id === id ? { ...article, ...data } : article
        );

        // Update currentArticle if it's the same
        if (state.currentArticle?._id === id) {
          state.currentArticle = { ...state.currentArticle, ...data };
        }
      })

      // Add Comment
      .addCase(addArticleComment.fulfilled, (state, action) => {
        const { id, comment } = action.payload;

        // Update in articles array
        state.articles = state.articles.map(article =>
          article._id === id
            ? { ...article, comments: [...(article.comments || []), comment], commentsCount: (article.commentsCount || 0) + 1 }
            : article
        );

        // Update in myArticles array
        state.myArticles = state.myArticles.map(article =>
          article._id === id
            ? { ...article, comments: [...(article.comments || []), comment], commentsCount: (article.commentsCount || 0) + 1 }
            : article
        );

        // Update currentArticle if it's the same
        if (state.currentArticle?._id === id) {
          state.currentArticle = {
            ...state.currentArticle,
            comments: [...(state.currentArticle.comments || []), comment],
            commentsCount: (state.currentArticle.commentsCount || 0) + 1
          };
        }
      })

      // Delete Comment
      .addCase(deleteArticleComment.fulfilled, (state, action) => {
        const { articleId, commentId } = action.payload;

        // Update in articles array
        state.articles = state.articles.map(article =>
          article._id === articleId
            ? {
                ...article,
                comments: article.comments?.filter(c => c._id !== commentId) || [],
                commentsCount: Math.max((article.commentsCount || 1) - 1, 0)
              }
            : article
        );

        // Update in myArticles array
        state.myArticles = state.myArticles.map(article =>
          article._id === articleId
            ? {
                ...article,
                comments: article.comments?.filter(c => c._id !== commentId) || [],
                commentsCount: Math.max((article.commentsCount || 1) - 1, 0)
              }
            : article
        );

        // Update currentArticle if it's the same
        if (state.currentArticle?._id === articleId) {
          state.currentArticle = {
            ...state.currentArticle,
            comments: state.currentArticle.comments?.filter(c => c._id !== commentId) || [],
            commentsCount: Math.max((state.currentArticle.commentsCount || 1) - 1, 0)
          };
        }
      })

      // Increment Share
      .addCase(incrementArticleShare.fulfilled, (state, action) => {
        const { id, data } = action.payload;

        // Update in articles array
        state.articles = state.articles.map(article =>
          article._id === id ? { ...article, shares: data.shares } : article
        );

        // Update in myArticles array
        state.myArticles = state.myArticles.map(article =>
          article._id === id ? { ...article, shares: data.shares } : article
        );

        // Update currentArticle if it's the same
        if (state.currentArticle?._id === id) {
          state.currentArticle = { ...state.currentArticle, shares: data.shares };
        }
      });
  },
});

export const { clearError, resetArticleState } = articleSlice.actions;

export default articleSlice.reducer;
