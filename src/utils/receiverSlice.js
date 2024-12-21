import { createSlice } from "@reduxjs/toolkit";

const receiverSlice = createSlice({
  name: "receiver",
  initialState: {},
  reducers: {
    putUser: (state, action) => {
      return action.payload;
    },
  },
});

// export const { addProduct, removeProduct } = productSlice.actions;
export default receiverSlice;
export const { putUser } = receiverSlice.actions;
