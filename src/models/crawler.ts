import Axios from 'axios';
import { resolve } from 'url';

import Parser from './parser';
import { HTMLElementType } from './html-element';

export class Crawler {
  public queue: string[] = [];

  public tempQueue: string[] = [];

  public async init(startUrl?: string) {
    this.queue = [startUrl];
    await this.getLinks();

    console.log(this.queue);
  }

  public async getLinks() {
    for (const url of this.queue) {
      const src = await this.request(url);
      const tokens = Parser.tokenize(src.data);

      for (const token of tokens) {
        const tag = Parser.parseToken(token);
        const { tagName, type, attributes } = tag;
        const href = attributes['href'];

        if (type === HTMLElementType.Closing || tagName !== 'a') {
          continue;
        }

        if (href != null && href !== '') {
          this.tempQueue.push(resolve(url, href));
        }
      }
    }

    this.queue = this.tempQueue;
    this.tempQueue = [];
  }

  public request(url: string) {
    return Axios.get(url, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36'
      },
    });
  }
}

export default new Crawler();