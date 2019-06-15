import * as WebSocket from 'ws';
import * as Database from 'nedb';
import { resolve } from 'path';

export class Server {
  public wss: WebSocket.Server;

  public db = new Database({
    filename: resolve('storage/db.db'),
    autoload: true,
  });

  public init() {
    console.log('Initializing server on port 8000!');

    this.wss = new WebSocket.Server({ port: 8000 });
    this.wss.on('connection', this.onConnection);
  }

  public onConnection = (ws: WebSocket) => {
    console.log('New connection');

    ws.on('message', this.onMessage);
  }

  public onMessage = (data: WebSocket.Data) => {
    console.log('Message: ', data);
  }
}
