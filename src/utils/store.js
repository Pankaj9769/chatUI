import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Default to localStorage
import { combineReducers } from "redux";
import receiverSlice from "./receiverSlice";
import typingSlice from "./typingUser";

const persistConfig = {
  key: "root",
  storage,
};

const rootReducer = combineReducers({
  receiver: receiverSlice.reducer,
  typing: typingSlice.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
export default store;
