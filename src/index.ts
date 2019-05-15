import { resolve } from 'path';
import { readFileSync } from 'fs';

import Parser from './models/parser';
import { HTMLElementType } from './models/html-element';
import Crawler from './models/crawler';

const init = async () => {
  const src = readFileSync(resolve('./static', 'a.html'), 'utf8');

  Crawler.init('https://www.github.com');
}

init();