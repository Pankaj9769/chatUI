// import { useSocket } from "@/Context";
// import { useSelector } from "react-redux";

// class PeerService {
//   constructor() {
//     const socket = useSocket();
//     this.socket = socket;

//     const receiver = useSelector((state) => state.receiver);
//     this.remotePeerId = receiver._id;
//     if (!this.peer) {
//       this.peer = new RTCPeerConnection({
//         iceServers: [
//           { urls: "stun:stun.relay.metered.ca:80" },
//           {
//             urls: "turn:in.relay.metered.ca:80",
//             username: "98bcd1a1beadc91ee56f60bc",
//             credential: "s25G1WH5IOc+bxCA",
//           },
//           {
//             urls: "turn:in.relay.metered.ca:80?transport=tcp",
//             username: "98bcd1a1beadc91ee56f60bc",
//             credential: "s25G1WH5IOc+bxCA",
//           },
//           {
//             urls: "turn:in.relay.metered.ca:443",
//             username: "98bcd1a1beadc91ee56f60bc",
//             credential: "s25G1WH5IOc+bxCA",
//           },
//           {
//             urls: "turns:in.relay.metered.ca:443?transport=tcp",
//             username: "98bcd1a1beadc91ee56f60bc",
//             credential: "s25G1WH5IOc+bxCA",
//           },
//         ],
//       });

//       // *** THIS IS THE CORRECT PLACEMENT - INSIDE THE CONSTRUCTOR ***
//       this.peer.onicecandidate = (event) => {
//         if (event.candidate) {
//           console.log("ICE candidate generated:", event.candidate);
//           if (this.socket && this.remotePeerId) {
//             this.socket.emit("ice-candidate", {
//               to: this.remotePeerId,
//               candidate: event.candidate,
//             });
//           } else {
//             console.log("Socket or remotePeerId not available yet.");
//           }
//         } else {
//           console.log("ICE gathering complete");
//         }
//       };
//     }
//   }

//   async getAnswer(offer) {
//     if (this.peer) {
//       await this.peer.setRemoteDescription(offer);
//       const ans = await this.peer.createAnswer();
//       await this.peer.setLocalDescription(new RTCSessionDescription(ans));
//       return ans;
//     }
//   }

//   async setLocalDescription(ans) {
//     if (this.peer) {
//       await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
//     }
//   }

//   async getOffer() {
//     if (this.peer) {
//       const offer = await this.peer.createOffer();
//       await this.peer.setLocalDescription(new RTCSessionDescription(offer));
//       return offer;
//     }
//   }
// }

// export default PeerService;

class PeerService {
  constructor(socket, remotePeerId) {
    this.socket = socket;
    this.remotePeerId = remotePeerId;
    if (!this.peer) {
      this.peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: "turn:in.relay.metered.ca:80",
            username: "98bcd1a1beadc91ee56f60bc",
            credential: "s25G1WH5IOc+bxCA",
          },
          {
            urls: "turns:in.relay.metered.ca:443",
            username: "98bcd1a1beadc91ee56f60bc",
            credential: "s25G1WH5IOc+bxCA",
          },
          { urls: "stun.voxgratia.org" }, // STUN server as fallback
        ],
      });

      // Correct placement - INSIDE the constructor
      this.peer.onicecandidate = (event) => {
        if (event.candidate) {
          if (this.socket && this.remotePeerId) {
            this.socket.emit("ice-candidate", {
              to: this.remotePeerId,
              candidate: event.candidate,
            });
          } else {
            console.log("Socket or remotePeerId not available yet.");
          }
        } else {
          console.log("ICE gathering complete");
        }
      };
    }
  }

  async getAnswer(offer) {
    if (this.peer) {
      await this.peer.setRemoteDescription(offer);
      const ans = await this.peer.createAnswer();
      await this.peer.setLocalDescription(new RTCSessionDescription(ans));
      return ans;
    }
  }

  async setLocalDescription(ans) {
    if (this.peer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
    }
  }

  async getOffer() {
    if (this.peer) {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(new RTCSessionDescription(offer));
      return offer;
    }
  }
}

export default PeerService;
