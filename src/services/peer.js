class PeerService {
  constructor() {
    // this.
    if (!this.peer) {
      this.peer = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.relay.metered.ca:80" },
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
