import { configureStore } from '@reduxjs/toolkit';

import userReducer from './slices/userSlice';
import activityReducer from './slices/ActivitySlice';
import aiReducer from './slices/aiSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    activity: activityReducer,
    ai: aiReducer,
  },
});

export default store;
