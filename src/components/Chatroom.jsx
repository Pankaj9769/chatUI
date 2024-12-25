import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Send, Video } from "lucide-react";
import { useSocket } from "@/Context";
import { useDispatch, useSelector } from "react-redux";
import { isTyping, notTyping } from "@/utils/typingUser";
import { useNavigate } from "react-router-dom";
import VideoCallDialog from "@/Pages/VideoCall";
import IncomingCallDialog from "@/Pages/IncomingCallDialog";
import VideoCallRinging from "./Calling";
import { fabClasses } from "@mui/material";

function ChatRoom({ user }) {
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [online, setOnline] = useState([]);
  const messagesEndRef = useRef(null);
  const receiver = useSelector((state) => state.receiver);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const typing = useSelector((state) => state.typing);
  const [call, setCall] = useState(false);
  const [incomingCall, setIncoming] = useState(null);
  const [pickedUp, setPickUp] = useState(false);

  const [isIncoming, setIsIncoming] = useState(false);

  const callUser = (to) => {
    const from = {
      _id: JSON.parse(localStorage.getItem("user"))._id,
      name: JSON.parse(localStorage.getItem("user")).name,
      socketId: socket.id,
    };
    console.log(to);
    // socket.emit("call:user", { from, to });
    // navigate('')

    socket.emit("user:call", { from, to });
    setCall(true);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    const data = {
      from: JSON.parse(localStorage.getItem("user"))._id,
      to: user._id,
      message: newMessage,
    };

    if (newMessage.trim()) {
      socket.emit("sendMessage", data);
      setMessages([...messages, { text: newMessage, sender: "me" }]);
      setNewMessage("");
    }
  };

  const handleReceiveMessage = useCallback((data) => {
    if (data.sender !== JSON.parse(localStorage.getItem("user"))._id) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: data.message,
          sender: "notme",
        },
      ]);
    }
  });

  const handleFetchHistory = (data) => {
    setMessages([]);
    const currentUser = JSON.parse(localStorage.getItem("user")); // Retrieve user once
    const formattedMessages = data.messages.map((msg) => ({
      text: msg.message,
      sender: msg.sender === currentUser._id ? "me" : "notme",
    }));
    setMessages((prevMessages) => [...prevMessages, ...formattedMessages]); // Batch update
  };

  const handleAddTypingUser = useCallback(({ from }) => {
    dispatch(isTyping(from));
  });

  const handleRemoveTypingUser = useCallback(({ from }) => {
    dispatch(notTyping(from));
  });

  const handleAddOnlineUser = useCallback(({ from }) => {
    console.log(from);
    if (online.includes(from)) return;
    socket.emit("online", {
      from: JSON.parse(localStorage.getItem("user"))._id,
      to: receiver._id,
    });
    setOnline([...online, from]);
  });

  useEffect(() => {
    socket.emit("online", {
      from: JSON.parse(localStorage.getItem("user"))._id,
      to: receiver._id,
    });

    return () => {};
  }, []);

  useEffect(() => {
    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("chatHistory", handleFetchHistory);

    return () => {
      socket.off("chatHistory", handleFetchHistory);
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [socket, handleFetchHistory, handleReceiveMessage]);

  useEffect(() => {
    socket.on("typingIndicator", handleAddTypingUser);
    socket.on("notTypingIndicator", handleRemoveTypingUser);
    socket.on("online", handleAddOnlineUser);

    socket.on("offline", ({ from }) => {
      setOnline((prev) => prev.filter((id) => id !== from));
    });

    return () => {
      socket.off("typingIndicator", handleAddTypingUser);
      socket.off("notTypingIndicator", handleRemoveTypingUser);
      socket.off("online", handleAddOnlineUser);
    };
  }, [
    socket,
    handleAddOnlineUser,
    handleAddTypingUser,
    handleRemoveTypingUser,
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleIncomingCall = ({ from }) => {
    console.log(`${from.name} is calling`);
    setIsIncoming(true);
    setIncoming(from);
  };

  const handleCallHungUp = () => {
    setIncoming(null);
  };

  useEffect(() => {
    socket.on("call:incoming", handleIncomingCall);
    socket.on("call:hungup", handleCallHungUp);
    socket.on("user:call:pickedUp", ({ from }) => {
      setPickUp(true);
      setCall(false);
    });

    return () => {
      socket.off("call:incoming", handleIncomingCall);
      socket.off("call:hungup", handleCallHungUp);
    };
  }, [socket, handleIncomingCall, handleCallHungUp]);

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">Select a user to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {call && <VideoCallRinging closeCall={setCall} socket={socket} />}
      {incomingCall && (
        <IncomingCallDialog
          setPickUp={setPickUp}
          callerAvatar={<AvatarImage alt={incomingCall.name} />}
          caller={incomingCall}
        />
      )}
      {pickedUp && (
        <VideoCallDialog isIncoming={isIncoming} closeCall={setPickUp} />
      )}
      <div className="border-b border-border p-4 bg-purple-50 flex flex-row items-center justify-between">
        <div className=" flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage alt={receiver.name} />
            <AvatarFallback>{receiver.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold">
              {receiver.name}
              {"      "}
              {online.includes(receiver._id) ? (
                <span className="inline-block bg-green-500 h-2 w-2 rounded-full ml-2"></span>
              ) : (
                <span className="inline-block bg-red-500 h-2 w-2 rounded-full ml-2"></span>
              )}
            </span>
            {typing.includes(receiver._id) && (
              <span className="text-gray-400 transition-opacity duration-300 animate-fadeIn">
                Typing...
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => {
            callUser(receiver);
          }}
          className="hover:bg-purple-100 p-2 rounded-full hover:text-purple-700 cursor-pointer"
        >
          <Video />
        </button>
      </div>

      <ScrollArea className="flex-1 p-4">
        {messages &&
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex mb-4 ${
                message.sender === `me` ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] py-2 px-3  ${
                  message.sender === `me`
                    ? "bg-primary text-white rounded-b-full rounded-tl-full"
                    : "border-primary border-[1px] text-primary rounded-b-full rounded-tr-full"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}

        <div ref={messagesEndRef}></div>
      </ScrollArea>
      <form
        onSubmit={handleSendMessage}
        className="border-t border-border p-4 flex"
      >
        <Input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 mr-2"
          onFocus={() => {
            socket.emit("typing", {
              to: receiver._id,
              from: JSON.parse(localStorage.getItem("user"))._id,
            });
          }}
          onBlur={() => {
            socket.emit("notTyping", {
              to: receiver._id,
              from: JSON.parse(localStorage.getItem("user"))._id,
            });
          }}
        />
        <Button type="submit">
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  );
}

export default ChatRoom;
