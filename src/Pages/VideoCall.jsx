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
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PhoneOff } from "lucide-react";
import { useSelector } from "react-redux";
import ReactPlayer from "react-player";
import PeerService from "../services/peer";
import { useSocket } from "@/Context";

const VideoCallDialog = ({ closeCall, isIncoming }) => {
  const [isOpen, setIsOpen] = useState(true);
  const receiver = useSelector((state) => state.receiver);
  const [myStream, setMyStream] = useState(null);
  const playerRef = useRef(null); // Ref for ReactPlayer
  const socket = useSocket();
  const [remoteId, setRemoteId] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const [peerConnection, setPeerConnection] = useState(null); // Local component state
  const [isPeerReady, setIsPeerReady] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    return () => {
      setHasMounted(false);
      if (peerConnection) {
        peerConnection.peer.close();
      }
    };
  }, []);

  const peerSet = useCallback(async () => {
    const offer = await peerConnection.getOffer();
    const from = JSON.parse(localStorage.getItem("user"))._id;
    const to = receiver._id;
    socket.emit("offer", { from, to, offer });
  }, [peerConnection]);

  useEffect(() => {
    console.log("peer set");
    console.log(peerConnection);

    if (peerConnection && !isIncoming) {
      peerSet();
    }
  }, [peerConnection]);

  useEffect(() => {
    if (!isIncoming) {
      const startCall = async () => {
        if (hasMounted && socket) {
          const newPeer = new PeerService(socket, receiver._id);
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: { width: { ideal: 1280 }, height: { ideal: 720 } }, // Request specific resolution
          });
          console.log("peer initiated");
          setPeerConnection(newPeer);

          setIsPeerReady(true);

          setMyStream(stream);
        }
      };
      startCall();
    } else {
      const getLocalStream = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          });
          setMyStream(stream);
        } catch (error) {
          console.error("Error accessing media devices:", error);
          closeCall(false);
          setIsOpen(false);
        }
      };
      getLocalStream();
    }
  }, [socket, receiver, hasMounted]);

  // useEffect(() => {
  //   if (!isIncoming) {
  //   } else {
  //     receiveCall();
  //   }
  //   return () => {
  //     if (myStream) {
  //       myStream.getTracks().forEach((track) => track.stop());
  //     }
  //   };
  // }, [startCall]);

  // const startCall = useCallback(async () => {
  //   try {
  // const stream = await navigator.mediaDevices.getUserMedia({
  //   audio: true,
  //   video: { width: { ideal: 1280 }, height: { ideal: 720 } }, // Request specific resolution
  // });

  //     const offer = await peer.getOffer();
  //     const from = JSON.parse(localStorage.getItem("user"))._id;
  //     const to = receiver._id;
  //     socket.emit("offer", { from, to, offer });

  //     setMyStream(stream);
  //   } catch (error) {
  //     console.error("Error accessing media devices:", error);
  //     closeCall(false);
  //     setIsOpen(false);
  //   }
  // }, [closeCall]);

  const receiveCall = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: { width: { ideal: 1280 }, height: { ideal: 720 } }, // Request specific resolution
    });
    setMyStream(stream);
  };

  // const emitAnswer = useCallback(
  //   async ({ from, offer }) => {
  //     // setRemoteId(from);
  //     localStorage.setItem("remoteId", from);
  //     const ans = await peerConnection.getAnswer(offer);
  //     console.log("answer emitted");
  //     socket.emit("answer", { to: from, ans });
  //   },
  //   [socket, peerConnection]
  // );
  const emitAnswer = useCallback(
    async ({ from, offer }) => {
      try {
        // Create PeerService ONLY when an offer is received
        const newPeer = new PeerService(socket, from); // Use 'from' as receiver ID
        setPeerConnection(newPeer);
        localStorage.setItem("remoteId", from);

        const ans = await newPeer.getAnswer(offer); // Use newPeer here
        socket.emit("answer", { to: from, ans });
      } catch (error) {
        console.error("Error in emitAnswer:", error);
      }
    },
    [socket]
  );

  const sendStream = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peerConnection.peer.addTrack(track, myStream);
    }
  }, [myStream, peerConnection]);

  const receiveAnswer = useCallback(
    async ({ from, ans }) => {
      // setRemoteId(from);
      localStorage.setItem("remoteId", from);
      await peerConnection.setLocalDescription(ans);
      console.log("answer received");
      sendStream();
    },
    [sendStream, peerConnection]
  );

  const handleNegoReceiver = useCallback(
    async ({ from, offer }) => {
      const ans = await peerConnection.getAnswer(offer);
      console.log("nego received");
      socket.emit("peer:nego:final", { to: from, ans });
    },
    [socket, peerConnection]
  );

  const handleTrack = useCallback(async (event) => {
    const remote = event.streams;
    console.log("remote stream->>");
    console.log(remote);
    setRemoteStream(remote[0]);
  }, []);

  const handleNegoIncoming = useCallback(
    async ({ from, offer }) => {
      const ans = await peerConnection.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket, peerConnection]
  );

  const handleNegoFinal = useCallback(
    async ({ ans }) => {
      await peerConnection.setLocalDescription(ans);
    },
    [peerConnection]
  );

  useEffect(() => {
    socket.on("user:offer", emitAnswer);
    socket.on("answer", receiveAnswer);
    socket.on("peer:nego:needed", handleNegoIncoming);
    socket.on("peer:nego:final", handleNegoFinal);

    return () => {
      socket.off("user:offer", emitAnswer);
      socket.off("answer", receiveAnswer);
      socket.off("peer:nego:needed", handleNegoIncoming);
      socket.off("peer:nego:final", handleNegoFinal);
    };
  }, [socket, emitAnswer, receiveAnswer, handleNegoIncoming, handleNegoFinal]);

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peerConnection.getOffer();
    console.log("nego sent");
    socket.emit("peer:nego:needed", {
      offer,
      to: localStorage.getItem("remoteId"),
    });
  }, [peerConnection]);

  useEffect(() => {
    if (peerConnection) {
      peerConnection.peer.addEventListener("track", handleTrack);
      peerConnection.peer.addEventListener(
        "negotiationneeded",
        handleNegoNeeded
      );
    }

    return () => {
      peerConnection?.peer.removeEventListener("track", handleTrack);
      peerConnection?.peer.removeEventListener(
        "negotiationneeded",
        handleNegoNeeded
      );
    };
  }, [handleNegoNeeded, handleTrack, peerConnection]);
  // useEffect(() => {
  //   // peer.peer.
  //   peer.peer.addEventListener("track", handleTrack);
  //   peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);

  //   return () => {
  //     peer.peer.removeEventListener("track", handleTrack);
  //     peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
  //   };
  // }, [handleNegoNeeded, handleTrack]);

  const handleEndCall = () => {
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
    }
    closeCall(false);
    setIsOpen(false);
  };

  useEffect(() => {
    if (remoteStream && isIncoming) {
      sendStream();
    }
  }, [remoteStream]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        {" "}
        {/* Increased max-width */}
        <DialogHeader>
          <DialogTitle>Video Call with {receiver?.name || "User"}</DialogTitle>{" "}
          {/* Display receiver name */}
        </DialogHeader>
        <div className="relative w-full h-full min-h-[400px] bg-gray-900 rounded-lg overflow-hidden">
          {remoteStream ? (
            <ReactPlayer
              ref={playerRef}
              url={remoteStream}
              playing
              width="100%"
              height="100%"
              style={{ position: "absolute", top: 0, left: 0 }}
              config={{
                file: {
                  attributes: {
                    playsInline: true,
                  },
                },
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-center">
                <p className="text-xl font-semibold mb-2">
                  Waiting for other participant...
                </p>
                <div className="animate-pulse">
                  <div className="h-3 w-3 bg-blue-500 rounded-full inline-block mr-1"></div>
                  <div className="h-3 w-3 bg-blue-500 rounded-full inline-block mr-1 animate-pulse delay-150"></div>
                  <div className="h-3 w-3 bg-blue-500 rounded-full inline-block animate-pulse delay-300"></div>
                </div>
              </div>
            </div>
          )}

          <div className="absolute bottom-4 right-4 w-1/4 aspect-video bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            {myStream ? (
              <ReactPlayer
                ref={playerRef}
                url={myStream}
                playing
                muted
                width="100%"
                height="100%"
                config={{
                  file: {
                    attributes: {
                      playsInline: true,
                    },
                  },
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">Loading your video...</p>
              </div>
            )}
          </div>
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

// useEffect(() => {
//   // Set up local media stream
//   navigator.mediaDevices
//     .getUserMedia({ video: true, audio: true })
//     .then((stream) => {
//       localStreamRef.current = stream;

//       // Display local video
//       const remoteVideo = document.getElementById("remote-video");
//       const localVideo = document.getElementById("local-video");
//       if (localVideo) {
//         console.log("stream");
//         console.log(stream);
//         localVideo.srcObject = stream;
//       }

//       // Initialize peer connection
//       const peer = new RTCPeerConnection({
//         iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//       });

//       // Add local tracks to peer connection
//       stream.getTracks().forEach((track) => peer.addTrack(track, stream));

//       // Handle ICE candidates
//       peer.onicecandidate = (event) => {
//         if (event.candidate) {
//           socket.emit("ice-candidate", {
//             candidate: event.candidate,
//             roomId: getRoomId(),
//           });
//         }
//       };

//       // Handle remote stream
//       peer.ontrack = (event) => {
//         console.log("Remote Video Event:", event);

//         // Initialize remoteStreamRef if not already
//         if (!remoteStreamRef.current) {
//           remoteStreamRef.current = new MediaStream();
//           console.log("Initialized remoteStreamRef.");
//         }

//         // Assign the video element
//         if (remoteVideo) {
//           remoteVideo.srcObject = remoteStreamRef.current;
//           console.log("Assigned remoteStreamRef to remote-video.");
//         } else {
//           console.error("Remote video element not found.");
//         }

//         // Add track to the MediaStream
//         if (event.track instanceof MediaStreamTrack) {
//           remoteStreamRef.current.addTrack(event.track);
//           setRemote(true);
//           console.log(
//             "Track added to remoteStreamRef:",
//             remoteStreamRef.current.getTracks()
//           );
//         } else {
//           console.error("Invalid track:", event.track);
//         }
//       };

//       // Create offer to initiate the call
//       peer
//         .createOffer()
//         .then((offer) => peer.setLocalDescription(offer))
//         .then(() => {
//           socket.emit("offer", {
//             offer: peer.localDescription,
//             roomId: getRoomId(),
//           });
//         })
//         .catch((error) => console.error("Error creating offer:", error));

//       peerConnectionRef.current = peer;
//     })
//     .catch((error) => console.error("Error accessing media devices:", error));

//   return () => {
//     // Clean up peer connection and streams
//     setRemote(false);
//     if (peerConnectionRef.current) peerConnectionRef.current.close();
//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach((track) => track.stop());
//     }
//     if (remoteStreamRef.current) remoteStreamRef.current = null;
//   };
// }, [receiver, socket]);

// useEffect(() => {
//   // Handle incoming offer
//   const handleOffer = async ({ offer, roomId }) => {
//     try {
//       await peerConnectionRef.current.setRemoteDescription(
//         new RTCSessionDescription(offer)
//       );

//       const answer = await peerConnectionRef.current.createAnswer();
//       await peerConnectionRef.current.setLocalDescription(answer);

//       socket.emit("answer", { answer, roomId });

//       // Process queued ICE candidates
//       while (pendingCandidates.current.length > 0) {
//         const candidate = pendingCandidates.current.shift();
//         await peerConnectionRef.current.addIceCandidate(candidate);
//       }
//     } catch (error) {
//       console.error("Error handling the offer:", error);
//     }
//   };

//   // Handle incoming ICE candidates
//   const handleICECandidate = async ({ candidate }) => {
//     if (peerConnectionRef.current.remoteDescription) {
//       try {
//         await peerConnectionRef.current.addIceCandidate(candidate);
//       } catch (error) {
//         console.error("Error adding ICE candidate:", error);
//       }
//     } else {
//       pendingCandidates.current.push(candidate);
//     }
//   };

//   socket.on("offer", handleOffer);
//   socket.on("ice-candidate", handleICECandidate);

//   return () => {
//     socket.off("offer", handleOffer);
//     socket.off("ice-candidate", handleICECandidate);
//   };
// }, [socket]);

// const handleEndCall = () => {
//   if (peerConnectionRef.current) {
//     peerConnectionRef.current.close();
//     peerConnectionRef.current = null;
//   }
//   if (localStreamRef.current) {
//     localStreamRef.current.getTracks().forEach((track) => track.stop());
//     localStreamRef.current = null;
//   }
//   remoteStreamRef.current = null;
//   closeCall(false);
//   setIsOpen(false);
// };
