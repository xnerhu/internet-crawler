import * as WebSocket from 'ws';
import { IncomingMessage } from 'http';

import { Server } from './server';
import { PACKAGE_SIZE } from '../constants';

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
      this.server.tempQueue = [...this.server.tempQueue, ...data];
      this.busy = false;

      if (this.server.queueStart + PACKAGE_SIZE - 1 <= this.server.queue.length) {
        this.server.finishedPackages++;
        this.assign();
      } else {
        this.server.onFinish();
      }
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

    console.log(`Assigning for #${this.server.peers.indexOf(this)} (${this.ip}), package ${this.server.finishedPackages + 1}/${this.server.packages}`);

    this.queueIndexies = this.server.getQueueIndexies();
    this.busy = true;

    this.send('assign-queue', this.queue);
  }
}
