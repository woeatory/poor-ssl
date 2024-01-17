const crypto = require('node:crypto');
const { handshakeMessages } = require("./handshake-utils");

const messages = {
  ...handshakeMessages,
  'MESSAGE': (context, message) => { onMessage(context, message) },
}

const onMessage = (context, message) => {
  if (!context.sessionKey) {
    console.log('Connection is unsecured');
    console.log(message);
    return message;
  }
  return decryptMessage(context, message);
}

const decryptMessage = (context, message) => {
  const decipher = crypto.createDecipheriv(context.encryptionAlgo, context.sessionKey, Buffer.from(message.iv, 'hex'));
  let decryptedMessage = decipher.update(message.message, 'hex', 'utf-8');
  decryptedMessage += decipher.final('utf-8');
  console.log(decryptedMessage);
  return decryptedMessage;
}

const encryptMessage = (context, message) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(context.encryptionAlgo, context.sessionKey, iv);
  let encryptedMessage = cipher.update(message, 'utf-8', 'hex');
  encryptedMessage += cipher.final('hex');
  return { iv: iv.toString('hex'), encryptedMessage };
}

module.exports = { messages, encryptMessage }