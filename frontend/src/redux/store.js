import { configureStore } from '@reduxjs/toolkit';

import activityReducer from './slices/ActivitySlice';
import aiReducer from './slices/aiSlice';
import postReducer from './slices/postSlice';
import userReducer from './slices/userSlice';
import articleReducer from './slices/articleSlice';
import userActivityReducer from './slices/userActivitySlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    activity: activityReducer,
    userActivity: userActivityReducer,
    ai: aiReducer,
    post: postReducer,
    article: articleReducer,
  },
});

export default store;
