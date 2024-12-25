import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { io } from "socket.io-client";
import { API_LINK } from "./utils/link";

export const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

const SocketProvider = ({ children }) => {
  const socket = useMemo(() => io(API_LINK));
  const userId = JSON.parse(localStorage.getItem("user"));
  if (userId) {
    socket.emit("register", {
      userId: userId._id,
    });
  }

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export default SocketProvider;
