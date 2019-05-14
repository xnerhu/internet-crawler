import { resolve } from 'path';
import { readFileSync } from 'fs';

import Parser from './models/parser';

const init = async () => {
  const src = readFileSync(resolve('./static', 'a.html'), 'utf8');
  const tokens = Parser.tokenize(src);

  for (const token of tokens) {
    const tag = Parser.parseToken(token);
    break;
  }
}

init();