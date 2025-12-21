import { configureStore } from '@reduxjs/toolkit';

import userReducer from './slices/userSlice';
import activityReducer from './slices/ActivitySlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    activity: activityReducer,
  },
});

export default store;
