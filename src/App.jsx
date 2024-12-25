import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Register from "./Pages/Register";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import ContextProvider, { useSocket } from "./Context";
import Profile from "./Pages/Profile";
import VideoCallDialog from "./Pages/VideoCall";
// Replace with your server's URL

const App = () => {
  const socket = useSocket();

  useEffect(() => {
    // console.log("Inssss")
    socket.on("call:incoming", ({ from }) => {
      console.log(`${from.name} is calling`);
    });
  }, [socket]);

  return (
    <>
      {/* <ContextProvider> */}
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/call" element={<VideoCallDialog />} />
        </Routes>
      </Router>
      {/* </ContextProvider> */}
    </>
  );
};

export default App;
