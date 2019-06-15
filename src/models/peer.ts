import * as WebSocket from 'ws';
import { IncomingMessage } from 'http';

import { Server } from './server';

export class Peer {
  public server: Server;

  public ws: WebSocket;

  public req: IncomingMessage;

  public available = true;

  public queueIndexies = { start: -1, end: -1 };

  constructor(server: Server, ws: WebSocket, req: IncomingMessage) {
    this.server = server;
    this.req = req;
    this.ws = ws;
  }

  public get ip() {
    return this.req.connection.remoteAddress;
  }

  public get queue() {
    const { start, end } = this.queueIndexies;
    return this.server.queue.slice(start, end);
  }

  public assign() {
    if (!this.available) {
      return console.log('Peer is not available!');
    }

    console.log(`Sending queue for ${this.ip}`);

    this.queueIndexies = this.server.getQueueIndexies();
    this.available = false;
    this.send('assign-queue', this.queue);
  }

  public send(action: string, data?: any) {
    this.ws.send(JSON.stringify({
      action,
      data,
    }));
  }
}
