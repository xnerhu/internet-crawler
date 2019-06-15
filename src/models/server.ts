import * as WebSocket from 'ws';
import * as Database from 'nedb';
import { resolve } from 'path';
import { IncomingMessage } from 'http';
import { readFileSync, existsSync } from 'fs';

import { Peer } from './peer';
import { PACKAGE_SIZE } from '../constants';

export class Server {
  public wss: WebSocket.Server;

  public peers: Peer[] = [];

  public queue: string[] = [];

  public queueStart = 0;

  public init() {
    console.log('Initializing server on port 7000!');

    this.loadQueue();
    this.wss = new WebSocket.Server({ port: 7000 });
    this.wss.on('connection', this.onConnection);
  }

  public onConnection = (ws: WebSocket, req: IncomingMessage) => {
    const peer = new Peer(this, ws, req);
    this.peers.push(peer);

    console.log(`New connection #${this.peers.length} from ${peer.ip}`);

    this.start();
  }

  public loadQueue() {
    const path = resolve('temp/queue.json');

    if (existsSync(path)) {
      this.queue = JSON.parse(readFileSync(path, 'utf8'));
    }
  }

  public start() {
    this.getAvailable().assign();
  }

  public getIndexies() {
    const start = this.queueStart;
    const end = Math.min(start + PACKAGE_SIZE, this.queue.length);

    this.queueStart = Math.min(end, this.queue.length - 1);

    return { start, end, size: this.queue.length };
  }

  public getAvailable() {
    return this.peers.find(r => r.available);
  }
}
