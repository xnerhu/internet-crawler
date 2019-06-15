import * as WebSocket from 'ws';
import { IncomingMessage } from 'http';

import { Server } from './server';
import { PACKAGE_SIZE } from '../constants';

export class Peer {
  public server: Server;

  public ws: WebSocket;

  public req: IncomingMessage;

  public available = true;

  public queueStart = -1;

  public queueEnd = -1;

  constructor(server: Server, ws: WebSocket, req: IncomingMessage) {
    this.server = server;
    this.req = req;
    this.ws = ws;
    this.ws.on('message', this.onMessage);
  }

  public get ip() {
    return this.req.connection.remoteAddress;
  }

  public onMessage = (data: WebSocket.Data) => {
    console.log('Message: ', data);
  }

  public assign() {
    if (!this.available) {
      return console.log('Peer is not available!');
    }

    console.log(`Assigning new queue for ${this.ip}`);

    while (true) {
      const indexies = this.server.getIndexies();

      console.log(indexies);

      for (let i = indexies.start; i < indexies.end; i++) {
        console.log(`${i}: ${this.server.queue[i]}`);
      }

      if (indexies.end >= indexies.size) break;
    }
  }
}
