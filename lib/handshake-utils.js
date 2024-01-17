const fs = require('node:fs');
const crypto = require('node:crypto');

const handshakeMessages = {
  'CLIENT HELLO': (context, message) => { onClientHello(context, message) },
  'PREMASTER': (context, message) => { onPremaster(context, message) },
}

const onClientHello = (context, message) => {
  handleClientHello(context, message);
  sendServerHello(context);
}

const handleClientHello = (context, message) => {
  context.clientRandom = Buffer.from(message.number.toString(), 'utf-8');
}

const sendServerHello = (context) => {
  const cert = getCert();
  const prime = crypto.generatePrimeSync(32, { bigint: true }); // FIXME: magick number
  context.serverRandom = Buffer.from(Number(prime).toString(), 'utf-8');
  const message = {
    header: 'SERVER HELLO',
    number: Number(prime),
    cert: cert
  }
  context.socket.write(JSON.stringify(message));
}

const getCert = () => fs.readFileSync('./cert.pem').toString();

const onPremaster = (context, message) => {
  context.premaster = decryptPremaster(message.premaster);
  createSessionKey(context);
}

const decryptPremaster = (encryptedPremaster) => {
  const privateKeyBuf = getPrivateKey();
  const privateKey = crypto.createPrivateKey(privateKeyBuf);
  const premasterBuf = Buffer.from(encryptedPremaster, 'base64');
  const decryptedPremaster = crypto.privateDecrypt(privateKey, premasterBuf);
  console.log('premaster: ' + decryptedPremaster.toString('hex'));
  return decryptedPremaster;
}

const getPrivateKey = () => fs.readFileSync('./key.pem');

const createSessionKey = (context) => {
  context.premaster = Buffer.from(context.premaster.toString(), 'utf-8');
  context.serverRandom = Buffer.from(context.serverRandom.toString(), 'utf-8');
  context.clientRandom = Buffer.from(context.clientRandom.toString(), 'utf-8');
  const concatenatedBuffer = Buffer.concat([context.clientRandom, context.serverRandom, context.premaster]);
  const sha256 = crypto.createHash('sha256');
  context.sessionKey = sha256.update(concatenatedBuffer).digest();
  console.log('Session Key:', context.sessionKey.toString('hex'));
}

module.exports = { handshakeMessages }