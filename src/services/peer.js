class PeerService {
  constructor() {
    // this.
    if (!this.peer) {
      this.peer = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun.l.google.com:5349" },
          { urls: "stun:stun1.l.google.com:3478" },
          { urls: "stun:stun1.l.google.com:5349" },
          { urls: "stun:stun2.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:5349" },
          { urls: "stun:stun3.l.google.com:3478" },
          { urls: "stun:stun3.l.google.com:5349" },
          { urls: "stun:stun4.l.google.com:19302" },
          { urls: "stun:stun4.l.google.com:5349" },
          {
            urls: "turn:in.relay.metered.ca:80",
            username: "98bcd1a1beadc91ee56f60bc",
            credential: "s25G1WH5IOc+bxCA",
          },
          {
            urls: "turn:in.relay.metered.ca:80?transport=tcp",
            username: "98bcd1a1beadc91ee56f60bc",
            credential: "s25G1WH5IOc+bxCA",
          },
          {
            urls: "turn:in.relay.metered.ca:443",
            username: "98bcd1a1beadc91ee56f60bc",
            credential: "s25G1WH5IOc+bxCA",
          },
          {
            urls: "turns:in.relay.metered.ca:443?transport=tcp",
            username: "98bcd1a1beadc91ee56f60bc",
            credential: "s25G1WH5IOc+bxCA",
          },
        ],
      });
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

export default new PeerService();
