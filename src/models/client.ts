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
      this.queue = data;
      this.counter = { errors: 0, finished: 0 };
      this.start();
    }
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
