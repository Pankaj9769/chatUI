import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Phone, PhoneOff } from "lucide-react";

const IncomingCallDialog = ({ callerName, callerAvatar }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleAcceptCall = () => {
    console.log("Accepting call...");
    setIsOpen(false);
    // Add logic here to accept the call
  };

  const handleRejectCall = () => {
    console.log("Rejecting call...");
    setIsOpen(false);
    // Add logic here to reject the call
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">Incoming Call</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center mt-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src={callerAvatar} alt={callerName} />
            <AvatarFallback>{callerName.charAt(0)}</AvatarFallback>
          </Avatar>
          <h2 className="mt-4 text-2xl font-semibold">{callerName}</h2>
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
