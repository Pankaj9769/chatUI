import React, { useEffect } from "react";
import { Phone } from "lucide-react";
import { useSelector } from "react-redux";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import toast, { Toaster } from "react-hot-toast";
import { useSocket } from "@/Context";

const VideoCallRinging = ({ closeCall }) => {
  const receiver = useSelector((state) => state.receiver);
  const socket = useSocket();

  const handleHangUp = () => {
    closeCall(false);
    socket.emit("call:hangup", {
      from: JSON.parse(localStorage.getItem("user"))._id,
      to: receiver._id,
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      closeCall(false);
      toast.error(`${receiver.name} did not pickup`);
    }, 15000);

    // Cleanup function to clear the timeout
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleCallCancelled = () => {
    toast.error(`${receiver.name} did not pickup`);
    closeCall(false);
  };

  useEffect(() => {
    socket.on("user:call:cancelled", handleCallCancelled);
    // socket.on()
    return () => {
      socket.off("user:call:cancelled", handleCallCancelled);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-xl flex flex-col items-center justify-center  p-8 max-w-sm w-full text-center">
        <Avatar className="w-24 h-24 flex flex-row items-center justify-center">
          <AvatarImage src={receiver.name} alt={receiver.name} />
          <AvatarFallback>{receiver.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {receiver.name}
        </h2>
        <div className="flex items-center justify-center mb-6 select-none">
          <span className="text-xl font-semibold mr-2 text-gray-700">
            Calling
          </span>
          <span className="flex">
            <span className="animate-bounce text-blue-500">.</span>
            <span className="animate-bounce delay-100 text-blue-500">.</span>
            <span className="animate-bounce delay-200 text-blue-500">.</span>
          </span>
        </div>
        <button
          onClick={handleHangUp}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full flex items-center justify-center transition duration-300 ease-in-out transform hover:scale-105"
        >
          <Phone className="w-6 h-6 mr-2" />
          Hang Up
        </button>
      </div>
      <Toaster />
    </div>
  );
};

export default VideoCallRinging;
