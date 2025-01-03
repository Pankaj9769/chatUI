import { useEffect, useState } from "react";
import Userlist from "../components/Userlist";
import Chatroom from "../components/Chatroom";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { API_LINK } from "@/utils/link";
const Dashboard = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [chat, setChat] = useState(null);

  useEffect(() => {
    console.log("token->>>>" + token);
    if (!token) {
      navigate("/login");
    }
    if (localStorage.length >= 1)
      setName(JSON.parse(localStorage.getItem("user")).name);
  }, []);

  const [name, setName] = useState("");
  const [friends, setFriends] = useState(null);

  // useEffect()
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_LINK}api/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          method: "GET",
        });

        const data = await response.json();

        if (!response.ok) {
          console.log(
            data.response === "Error: TokenExpiredError: jwt expired"
          );
          if (data.response === "Error: TokenExpiredError: jwt expired") {
            console.log("Token Expired");
            toast.error("Session expired! Please login again");
            return;
          }
          throw new Error(`Error: ${response}`);
        }

        // console.log("Users:", data.users[0]);
        setFriends(
          data.users.filter(
            (user) => user._id !== JSON.parse(localStorage.getItem("user"))._id
          )
        );

        console.log(friends);
        return data;
      } catch (error) {
        console.error("Error fetching users:", error);
        return null;
      }
    };

    fetchUsers();
  }, []);
  return (
    <>
      <div className="flex h-screen bg-background">
        <Userlist friends={friends} setChatRoom={setChat} />
        <Chatroom user={chat} />
        <Toaster />
      </div>
    </>
  );
};

export default Dashboard;
