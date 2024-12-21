import React, { createContext, useState } from "react";

export const MyContext = createContext({
  user: null,
  friends: null,
  notify: false,
});

const ContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState(null);
  const [notify, setNotify] = useState([]);

  const contextValue = {
    user,
    setUser,
    friends,
    setFriends,
    notify,
    setNotify,
  };

  return (
    <MyContext.Provider value={contextValue}>{children}</MyContext.Provider>
  );
};

export default ContextProvider;
