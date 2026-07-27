import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  loading: false,
  isClickedBookedNow: false,
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
      state.isClickedBookedNow = false;
    },
    setClickedBookNow: (state, action) => {
      state.isClickedBookedNow = action.payload;
    },
  },
});

export const {
  authStart,
  authSuccess,
  authFailure,
  updateProfileSuccess,
  logoutSuccess,
  setClickedBookNow,
} = authSlice.actions;

export default authSlice.reducer;
