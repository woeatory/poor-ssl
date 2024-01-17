const { Server } = require('./lib/server');

const server = new Server();

setTimeout(() => { server.sendData('Hello from server') }, 5000)