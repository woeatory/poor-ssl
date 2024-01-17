const net = require('node:net');
const { messages, encryptMessage } = require('./communication');

class Server {
  netServer;
  socket;
  clientRandom;
  serverRandom;
  premaster;
  sessionKey;
  encryptionAlgo = 'aes-256-cbc';

  constructor() {
    this.netServer = net.createServer((socket) => {
      this.socket = socket;
      this.socket.on('data', (data) => this.onRecieveData(data));
      this.socket.on('error', (error) => this.onError(error));
      this.socket.on('end', () => this.onEnd());
    });

    this.netServer.listen(3000, () => {
      console.log('Listening');
    });
  }

  sendData(data) {
    if (!this.socket) return;
    const message = {
      header: 'MESSAGE',
    };
    if (this.sessionKey) {
      const {iv, encryptedMessage} = encryptMessage(this, data);
      message.iv = iv;
      message.message = encryptedMessage;
    }
    this.socket.write(JSON.stringify(message));
  }

  // events
  onRecieveData(data) {
    const message = JSON.parse(data);
    const handler = messages[message.header];
    if (handler) return handler(this, message);
    else {
      console.error('Unknown message type');
    }
  }

  onEnd() {
    console.log('Client disconnected');
  }
  onError(error) {
    console.error(error);
  }
}

module.exports = { Server }