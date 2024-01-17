const net = require('node:net');
const crypto = require('node:crypto');
const { messages, encryptMessage } = require('./communication');

class Client {
  socket;
  serverRandom;
  clientRandom;
  premaster;
  cert;
  publicKey;
  PREMASTER_SIZE = 6;
  sessionKey;
  encryptionAlgo = 'aes-256-cbc';

  constructor() {
    this.socket = net.createConnection({ port: 3000 }, () => {
      console.log('Connected to server');
    });

    this.socket.on('data', (data) => this.onRecieveData(data));
    this.socket.on('error', (error) => this.onError(error));
    this.socket.on('end', () => this.onEnd());
    this.sendClientHello();
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

  // onRecieveDataSecured(data) {
  //   const message = JSON.parse(data);
  //   switch (message.header) {
  //     case 'SERVER HELLO':
  //       this.handleServerHello(message);
  //       this.sendPremasterKey();
  //       this.createSessionKey();
  //       // const encryptedMessage = this.encryptMessage('this is message');
  //       // this.sendData(JSON.stringify({ header: 'MESSAGE', message: encryptedMessage.message, iv: encryptedMessage.iv }));
  //       break;

  //     default:
  //       console.log('encrypted message:');
  //       console.log(message);
  //       console.log('decrypted message:');
  //       console.log(this.decryptMessage(message.message, message.iv));
  //   }
  // }

  onEnd() {
    console.log('Disconnected from server');
  }

  onError(error) {
    console.error(error);
  }

  
  // TODO: 
  sendClientHello() {
    const prime = crypto.generatePrimeSync(32, { bigint: true });
    this.clientRandom = Number(prime);
    const message = {
      header: 'CLIENT HELLO',
      number: Number(prime),
    }
    this.socket.write(JSON.stringify(message));
  }

}

module.exports = { Client }