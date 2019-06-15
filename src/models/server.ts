import * as WebSocket from 'ws';
import * as Database from 'nedb';
import { resolve } from 'path';
import { IncomingMessage } from 'http';
import { readFileSync, existsSync } from 'fs';

import { Peer } from './peer';
import { PACKAGE_SIZE } from '../constants';

export class Server {
  public db = new Database({
    filename: resolve('storage/db.db'),
    autoload: true,
  });

  public wss: WebSocket.Server;

  public peers: Peer[] = [];

  public queue: string[] = [];

  public tempQueue: string[] = [];

  public queueStart = 0;

  public finishedPackages = 0;

  public init() {
    console.log('Initializing server on port 7000!');

    this.loadQueue();
    this.wss = new WebSocket.Server({ port: 7000 });
    this.wss.on('connection', this.onConnect);
  }

  public onConnect = (ws: WebSocket, req: IncomingMessage) => {
    const peer = new Peer(this, ws, req);
    this.peers.push(peer);

    console.log(`New connection #${this.peers.length - 1} from ${peer.ip}`);

    peer.assign();
  }

  public loadQueue() {
    const path = resolve('temp/queue.json');

    if (existsSync(path)) {
      this.queue = JSON.parse(readFileSync(path, 'utf8'));
    }
  }

  public getQueueIndexies() {
    const start = this.queueStart;
    const end = Math.min(start + PACKAGE_SIZE, this.queue.length);

    this.queueStart = Math.min(end, this.queue.length);
    return { start, end };
  }

  public onFinish() {
    console.log('\nFinished all.');

    const list = this.tempQueue.map(url => ({ url }));

    this.db.insert(list, (err) => {
      if (err) {
        console.log('Error while inserting urls into database!', err);
      }
    });

    this.queue = this.tempQueue;
    this.tempQueue = [];
    this.queueStart = 0;

    this.assignMany();
  }

  public assignMany() {
    for (const peer of this.peers) {
      peer.assign();
    }
  }

  public get packages() {
    return Math.ceil(this.queue.length / PACKAGE_SIZE);
  }
}
