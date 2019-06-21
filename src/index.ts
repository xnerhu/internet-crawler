import { Server, Client } from './models';

if (process.env.type === 'server') {
  const server = new Server();
  server.init();
} else {
  const client = new Client();
  client.init();
}
