const { Client } = require('./lib/client');

const client = new Client();

setTimeout(()=> {client.sendData('Hello, server. It\'s client')}, 6000);