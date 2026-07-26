import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';
import roomReducer from './roomSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    room: roomReducer,
  },
});
