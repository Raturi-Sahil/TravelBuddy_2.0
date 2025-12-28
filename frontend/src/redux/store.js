import { configureStore } from '@reduxjs/toolkit';

import activityReducer from './slices/ActivitySlice';
import aiReducer from './slices/aiSlice';
import articleReducer from './slices/articleSlice';
import chatReducer from './slices/chatSlice';
import guideReducer from './slices/guideSlice';
import notificationReducer from './slices/notificationSlice';
import postReducer from './slices/postSlice';
import userActivityReducer from './slices/userActivitySlice';
import userReducer from './slices/userSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    activity: activityReducer,
    userActivity: userActivityReducer,
    ai: aiReducer,
    post: postReducer,
    article: articleReducer,
    chat: chatReducer,
    guide: guideReducer,
    notifications: notificationReducer,
  },
});

export default store;


