import * as WebSocket from 'ws';
import { IncomingMessage } from 'http';

import { Server } from './server';

export class Peer {
  public server: Server;

  public ws: WebSocket;

  public req: IncomingMessage;

  public busy = false;

  public queueIndexies = { start: -1, end: -1 };

  constructor(server: Server, ws: WebSocket, req: IncomingMessage) {
    this.server = server;
    this.req = req;
    this.ws = ws;
    this.ws.on('message', this.onMessage);
  }

  public get ip() {
    return this.req.connection.remoteAddress;
  }

  public get queue() {
    const { start, end } = this.queueIndexies;
    return this.server.queue.slice(start, end);
  }

  public onMessage = (message: string) => {
    const { action, data } = JSON.parse(message);

    if (action === 'finish') {
      console.log(data);
    }
  }

  public send(action: string, data?: any) {
    this.ws.send(JSON.stringify({
      action,
      data,
    }));
  }

  public assign() {
    if (this.busy) {
      return console.log(`Peer #${this.server.peers.indexOf(this)} is busy!`);
    }

    console.log(`Assigning queue for #${this.server.peers.indexOf(this)} (${this.ip})`);

    this.queueIndexies = this.server.getQueueIndexies();
    this.busy = true;

    this.send('assign-queue', this.queue);
  }
}
