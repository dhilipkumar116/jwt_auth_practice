const { createClient } = require('redis');

const client = createClient({
  host: '127.0.0.1',
  port: 6379,
});
client.connect();

client.on('error', (err) => console.log(err.message));
client.on('connect', () => {
  console.log('client connected to redis.');
});

client.on('ready', () => {
  console.log('client connected to redis and ready to use.');
});

client.on('end', () => {
  console.log('client disconnected from redis');
});

process.on('SIGINT', () => {
  client.quit();
});

module.exports = client;
