// DEBUG: const SERVER_HOST="ws://localhost:8080";
const SERVER_HOST="wss://spellz.a1n.ch:4443";

export class SpellSocket {
    constructor() {
        this.socket = new WebSocket(SERVER_HOST);
        this.send = this.send.bind(this);
        this.then = this.then.bind(this);
        this.addReceiveHandler = this.addReceiveHandler.bind(this);
    }

    then(func) {
        // Connection opened
        this.socket.addEventListener("open", (event) => {
            func();
        });
        return this;
    }

    send(json) {
        this.socket.send(json);
    }

    addReceiveHandler(handler) {
        this.socket.onmessage = (event) => {
          handler(event.data);
        };
    }

}


export class Communication {
    constructor(spellSocket) {
        // This means in this object...
        this.onReceiveData = (data) => {console.log(data)};
        this.connect = this.connect.bind(this);
        this.onReceiveDataChannel = this.onReceiveDataChannel.bind(this);
        this.onIceCandidate = this.onIceCandidate.bind(this);

        // Let connect handle messages from Socket
        this.socket = spellSocket;
        this.socket.addReceiveHandler(this.connect);

        // get RTCPeerConnection (Browser dependant)
        var RTCPeerConnection = window.RTCPeerConnection || webkitRTCPeerConnection || mozRTCPeerConnection;
        // New Connection, we use STUN servers from goole, cause we're lazy
        this.peerConn = new RTCPeerConnection(
            {
                'iceServers': [
                    {
                        'urls': [
                            'stun:stun.l.google.com:19302',
                            'stun:stun3.l.google.com:19302',
                            'stun:stun.solnet.ch:3478'
                        ]
                    }
                ]
            }
        );

        // New Data Channel
        this.dataChannel = this.peerConn.createDataChannel('spells');
        // When we receive data
        this.peerConn.ondatachannel = this.onReceiveDataChannel;

        // Set function to iceCandidate
        this.peerConn.onicecandidate = this.onIceCandidate;

        // Create offer for connection
        this.peerConn.createOffer().then(description => {
                // Export session description, so it can be joined
                this.peerConn.setLocalDescription(description);
            }
        );

    }

    onIceCandidate(e) {
        // event.candidate == null if all candidates gathered
        if (e.candidate == null) {
            console.log("Get joiners to call: ");
            // Generate info for other client so joining is possib
            console.log(this.localDescription);
            const sdp = {
                sdp: this.peerConn.localDescription.sdp,
                type: this.peerConn.localDescription.type
            };
            this.socket.send(JSON.stringify(sdp));
        } else {
             const iceCandidate = {
                type: "candidate",
                data: e            
            }
            this.socket.send(JSON.stringify(iceCandidate));
        }
    }

    onReceiveDataChannel(e) {
        e.channel.onmessage = (data) => {
            this.onReceiveData(data.data);
        }
    }

    setOnDataReceivedHandler(handler) {
        this.onReceiveData = handler;
    }


    connect(responseSdp) {
        // Add Ice Candidate from json description
        const sdp = JSON.parse(responseSdp);
        if (sdp.type !== "candidate") {
            this.peerConn.setRemoteDescription(
                new RTCSessionDescription(
                    {
                        sdp: sdp.sdp,
                        type: sdp.type,
                    }
                )
            )    
        }

        switch (sdp.type) {
            case "candidate":
                this.peerConn.addIceCandidate(sdp.data);
                return;
            case "offer":
                this.peerConn.createAnswer().then(description => {
                        // generate answer
                        this.peerConn.setLocalDescription(description);
                        const newSdp = {
                            sdp: description.sdp,
                            type: description.type
                        };
                        this.socket.send(JSON.stringify(newSdp));
                    }
                )
                break;
        }
    }

    send(msg) {
        try {
            console.log("trying to send: " + msg)
            this.dataChannel.send(msg);
        } catch (e) {
            console.log(e);
        }
    }
}