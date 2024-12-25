import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, PhoneOff } from "lucide-react";
import { useSocket } from "@/Context";

const IncomingCallDialog = ({ caller, callerAvatar, setPickUp }) => {
  const [isOpen, setIsOpen] = useState(true);
  const socket = useSocket();
  `
`;
  const handleAcceptCall = () => {
    console.log("Accepting call...");
    socket.emit("user:call:pickup", {
      from: JSON.parse(localStorage.getItem("user"))._id,
      to: caller._id,
    });
    setPickUp(true);
    setIsOpen(false);
  };

  const handleRejectCall = () => {
    console.log("Rejecting call...");
    setIsOpen(false);

    socket.emit("user:call:cancel", {
      from: JSON.parse(localStorage.getItem("user"))._id,
      to: caller._id,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">Incoming Call</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center mt-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src={callerAvatar} alt={caller.name} />
            <AvatarFallback>{caller.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <h2 className="mt-4 text-2xl font-semibold">{caller.name}</h2>
        </div>
        <div className="mt-8 flex justify-center space-x-4">
          <Button
            variant="destructive"
            onClick={handleRejectCall}
            className="rounded-full p-3"
          >
            <PhoneOff className="h-6 w-6" />
            <span className="sr-only">Reject call</span>
          </Button>
          <Button
            variant="default"
            onClick={handleAcceptCall}
            className="rounded-full p-3 bg-green-500 hover:bg-green-600"
          >
            <Phone className="h-6 w-6" />
            <span className="sr-only">Accept call</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IncomingCallDialog;
