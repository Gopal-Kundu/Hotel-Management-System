import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  rooms: [],
  totalPages: 1,
  currentPage: 1,
  loading: false,
  error: null,
};

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    roomStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    roomSuccess: (state, action) => {
      state.loading = false;
      if (Array.isArray(action.payload)) {
        state.rooms = action.payload;
        state.totalPages = 1;
        state.currentPage = 1;
      } else if (action.payload && action.payload.rooms) {
        state.rooms = action.payload.rooms;
        state.totalPages = action.payload.totalPages || 1;
        state.currentPage = action.payload.currentPage || 1;
      } else {
        state.rooms = [];
      }
      state.error = null;
    },
    roomFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearRoomError: (state) => {
      state.error = null;
    },
  },
});

export const {
  roomStart,
  roomSuccess,
  roomFailure,
  clearRoomError,
} = roomSlice.actions;

export default roomSlice.reducer;
