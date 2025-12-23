import { configureStore } from '@reduxjs/toolkit';

import userReducer from './slices/userSlice';
import activityReducer from './slices/ActivitySlice';
import aiReducer from './slices/aiSlice';
import postReducer from './slices/postSlice';
import articleReducer from './slices/articleSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    activity: activityReducer,
    ai: aiReducer,
    post: postReducer,
    article: articleReducer,
  },
});

export default store;
