import * as WebSocket from 'ws';
import { resolve } from 'url';

import { request } from '../utils';
import Parser from './html-parser';
import { HTMLElementType } from './html-element';
import { Counter } from './counter';

export class Client {
  public ws: WebSocket;

  public queue: string[] = [];

  public tempQueue: string[] = [];

  public counter: Counter;

  public busy = false;

  public init() {
    console.log('Initializing client!');

    this.ws = new WebSocket('ws://localhost:7000');
    this.ws.on('open', this.onOpen);
    this.ws.on('message', this.onMessage);
  }

  public onOpen() {
    console.log('Connected!');
  }

  public onMessage = (message: string) => {
    const { action, data } = JSON.parse(message);

    if (action === 'assign-queue') {
      if (this.busy) return console.log('Error! This peer is busy.');

      this.queue = data;
      this.busy = true;
      this.counter = { errors: 0, finished: 0 };
      this.start();
    }
  }

  public send(action: string, data?: any) {
    this.ws.send(JSON.stringify({
      action,
      data,
    }));
  }

  public async start() {
    const start = new Date();

    for (const url of this.queue) {
      await this.extract(url);

      this.counter.finished++;

      const percent = (this.counter.finished / this.queue.length * 100).toFixed(2);
      console.log(`${percent}% - ${url}`);
    }

    console.log(`\Done in ${Math.round((new Date().getTime() - start.getTime()) / 1000)}s`);

    this.end();
  }

  public end() {
    this.send('finish', this.tempQueue);

    this.tempQueue = [];
    this.queue = [];
    this.busy = false;
  }

  public async extract(url: string) {
    try {
      const { data } = await request(url);
      const tokens = Parser.tokenize(data);

      for (const token of tokens) {
        const tag = Parser.parseToken(token);
        const href = tag.attributes.href;

        if (tag == null || tag.type === HTMLElementType.Closing || tag.tagName !== 'a' || href == null) {
          continue;
        }

        this.tempQueue.push(resolve(url, tag.attributes.href));
      }
    } catch (error) {
      this.counter.errors++;
      console.log(`Error at ${url}`);
    }
  }
}
