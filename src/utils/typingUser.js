import { createSlice } from "@reduxjs/toolkit";

const typingSlice = createSlice({
  name: "typing",
  initialState: [],
  reducers: {
    isTyping: (state, action) => {
      state.push(action.payload);
    },
    notTyping: (state, action) => {
      return state.filter((user) => user !== action.payload);
    },
  },
});

export default typingSlice;
export const { isTyping, notTyping } = typingSlice.actions;
