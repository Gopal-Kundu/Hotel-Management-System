import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
    },
    authSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
    },
    authFailure: (state) => {
      state.loading = false;
    },
    updateProfileSuccess: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    logoutSuccess: (state) => {
      state.user = null;
      state.loading = false;
    },
  },
});

export const {
  authStart,
  authSuccess,
  authFailure,
  updateProfileSuccess,
  logoutSuccess,
} = authSlice.actions;

export default authSlice.reducer;
