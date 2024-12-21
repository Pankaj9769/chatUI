import { createSlice } from "@reduxjs/toolkit";

const onlineSlice = createSlice({
  name: "online",
  initialState: [],
  reducers: {
    isOnline: (state, action) => {
      state.push(action.payload);
    },
    makeOffline: (state, action) => {
      return state.filter((user) => user !== action.payload);
    },
  },
});

export default onlineSlice;
export const { isOnline, makeOffline } = onlineSlice.actions;
