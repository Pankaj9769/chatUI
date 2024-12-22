// import React, { useEffect, useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/Components/ui/dialog";
// import { Button } from "@/Components/ui/button";
// import { PhoneOff } from "lucide-react";
// import { useSelector } from "react-redux";

// const VideoCallDialog = ({ closeCall }) => {
//   const [isOpen, setIsOpen] = useState(true);
//   const receiver = useSelector((state) => state.receiver);

//   useEffect(() => {}, []);

//   const handleEndCall = () => {
//     // Add logic here to end the call
//     console.log("Ending call...");
//     closeCall(false);
//     setIsOpen(false);
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={setIsOpen}>
//       <DialogContent className="sm:max-w-[425px]">
//         <DialogHeader>
//           <DialogTitle>Video Call</DialogTitle>
//         </DialogHeader>
//         <div className="mt-4 aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
//           {/* Placeholder for video stream */}
//           <p className="text-gray-500">Video stream placeholder</p>
//         </div>
//         <div className="mt-4 flex justify-center">
//           <Button
//             variant="destructive"
//             onClick={handleEndCall}
//             className="rounded-full p-3"
//           >
//             <PhoneOff className="h-6 w-6" />
//             <span className="sr-only">End call</span>
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default VideoCallDialog;

import React, { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PhoneOff } from "lucide-react";
import { useSelector } from "react-redux";

const VideoCallDialog = ({ closeCall, socket }) => {
  const [isOpen, setIsOpen] = useState(true);
  const receiver = useSelector((state) => state.receiver);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const pendingCandidates = useRef([]);

  const getRoomId = () => {
    const userId = JSON.parse(localStorage.getItem("user"))._id;
    return [userId, receiver._id].sort().join("_");
  };

  useEffect(() => {
    // Set up the local media stream
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;

        // Display local video stream
        const localVideo = document.getElementById("local-video");
        if (localVideo) localVideo.srcObject = stream;

        // Initialize peer connection
        const peer = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        // Add local tracks to the peer connection
        stream.getTracks().forEach((track) => peer.addTrack(track, stream));

        // Handle ICE candidates
        peer.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", {
              candidate: event.candidate,
              roomId: getRoomId(),
            });
          }
        };

        // Handle remote stream
        peer.ontrack = (event) => {
          if (!remoteStreamRef.current) {
            remoteStreamRef.current = new MediaStream();
          }
          remoteStreamRef.current.addTrack(event.track);

          const remoteVideo = document.getElementById("remote-video");
          if (remoteVideo) remoteVideo.srcObject = remoteStreamRef.current;
        };

        // Create and send an offer
        peer
          .createOffer()
          .then((offer) => peer.setLocalDescription(offer))
          .then(() => {
            socket.emit("offer", {
              offer: peer.localDescription,
              roomId: getRoomId(),
            });
          })
          .catch((error) => console.error("Error creating offer:", error));

        peerConnectionRef.current = peer;
      })
      .catch((error) => console.error("Error accessing media devices:", error));

    return () => {
      // Clean up resources on unmount
      if (peerConnectionRef.current) peerConnectionRef.current.close();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      remoteStreamRef.current = null;
    };
  }, [receiver, socket]);

  useEffect(() => {
    // Handle incoming offer
    const handleOffer = async ({ offer, roomId }) => {
      if (!peerConnectionRef.current) return;
      try {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(offer)
        );

        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);

        socket.emit("answer", { answer, roomId });

        // Process queued ICE candidates
        while (pendingCandidates.current.length > 0) {
          const candidate = pendingCandidates.current.shift();
          await peerConnectionRef.current.addIceCandidate(candidate);
        }
      } catch (error) {
        console.error("Error handling the offer:", error);
      }
    };

    // Handle incoming ICE candidates
    const handleICECandidate = async ({ candidate }) => {
      if (!peerConnectionRef.current) return;
      if (peerConnectionRef.current.remoteDescription) {
        try {
          await peerConnectionRef.current.addIceCandidate(candidate);
        } catch (error) {
          console.error("Error adding ICE candidate:", error);
        }
      } else {
        pendingCandidates.current.push(candidate);
      }
    };

    socket.on("offer", handleOffer);
    socket.on("ice-candidate", handleICECandidate);

    return () => {
      socket.off("offer", handleOffer);
      socket.off("ice-candidate", handleICECandidate);
    };
  }, [socket]);

  const handleEndCall = () => {
    // End call and clean up resources
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    remoteStreamRef.current = null;
    closeCall(false);
    setIsOpen(false);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
      aria-describedby="dialog-description"
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Video Call</DialogTitle>
        </DialogHeader>
        <p id="dialog-description" className="sr-only">
          This is a video call interface. You can see local and remote videos
          here.
        </p>
        <div className="mt-4 aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
          <video id="local-video" autoPlay muted className="w-32 h-32 ml-0" />
          <video id="remote-video" autoPlay className="w-32 h-32" />
        </div>
        <div className="mt-4 flex justify-center">
          <Button
            variant="destructive"
            onClick={handleEndCall}
            className="rounded-full p-3"
          >
            <PhoneOff className="h-6 w-6" />
            <span className="sr-only">End call</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoCallDialog;
