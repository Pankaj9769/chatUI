import { useContext, useEffect, useRef, useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Send, Video } from "lucide-react";
import { MyContext } from "@/Context";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { isOnline } from "@/utils/onlineUser";
import { isTyping, notTyping } from "@/utils/typingUser";
import { CiMenuKebab } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import VideoCallDialog from "@/Pages/VideoCall";
import IncomingCallDialog from "@/Pages/IncomingCallDialog";

function ChatRoom({ user, socket }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [online, setOnline] = useState([]);
  // const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const receiver = useSelector((state) => state.receiver);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const typing = useSelector((state) => state.typing);
  const [call, setCall] = useState(false);
  const [incomingCall, setIncoming] = useState(false);
  // const { setNotify } = ssssuseContext(MyContext);
  useEffect(() => {
    console.log("New User->", online);
  }, [online, setOnline]);

  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      console.log("New message received:", data.message);
      if (data.sender !== JSON.parse(localStorage.getItem("user"))._id) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: data.message,
            sender: "notme",
          },
        ]);
        // if (user._id !== data.sender) {
        //   setNotify((prevNotify) => [...prevNotify, data.sender]);
        // }
      }
    });

    socket.on("typingIndicator", (data) => {
      // toast.success(`${user} ->>> ${data}`);
      // if (user && data === user._id)
      dispatch(isTyping(data));
      // setTyping(true);
    });

    socket.on("notTypingIndicator", (data) => {
      // setTyping(false);
      dispatch(notTyping(data));
    });

    socket.on("online", (data) => {
      console.log(`Hellooooo-> ${data}`);
      // dispatch(isOnline(data));
      setOnline([...online, data]);
    });

    // Listener for chat history
    socket.on("chatHistory", (data) => {
      setMessages([]);
      const currentUser = JSON.parse(localStorage.getItem("user")); // Retrieve user once
      const formattedMessages = data.messages.map((msg) => ({
        text: msg.message,
        sender: msg.sender === currentUser._id ? "me" : "notme",
      }));
      setMessages((prevMessages) => [...prevMessages, ...formattedMessages]); // Batch update
    });

    socket.on("offline", () => {
      setOnline("Offline");
    });
  }, []);

  // useEffect(() => {
  //   console.log("RHESE ARE MSGS->" + messages);
  // }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    const data = {
      sender: JSON.parse(localStorage.getItem("user"))._id,
      receiver: user._id,
      message: newMessage,
    };

    if (newMessage.trim()) {
      socket.emit("sendMessage", data);
      setMessages([...messages, { text: newMessage, sender: "me" }]);
      setNewMessage("");
    }
  };

  useEffect(() => {
    console.log("rec->");
    console.log(receiver.name);
  }, [receiver]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">Select a user to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {call && <VideoCallDialog closeCall={setCall} socket={socket} />}
      {incomingCall && (
        <IncomingCallDialog
          callerAvatar={<AvatarImage alt={receiver.name} />}
          callerName={receiver.name}
        />
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
            setCall(true);
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
              receiver: receiver._id,
              sender: JSON.parse(localStorage.getItem("user"))._id,
            });
          }}
          onBlur={() => {
            socket.emit("notTyping", {
              receiver: receiver._id,
              sender: JSON.parse(localStorage.getItem("user"))._id,
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
