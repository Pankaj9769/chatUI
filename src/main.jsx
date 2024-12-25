import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import ContextProvider from "./Context";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "./utils/store";
import SocketProvider from "./Context";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <Provider store={store}>
    <SocketProvider>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </SocketProvider>
  </Provider>

  // </StrictMode>
);
