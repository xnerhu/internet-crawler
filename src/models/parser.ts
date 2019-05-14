import { HyperLink } from "./hyper-link";

type CapturingType = 'none' | 'tag' | 'closed-tag' | 'comment' | 'script-tag';

interface HTMLElement {
  tagName?: string;

}

export class Parser {
  public isOpeningComment(i: number, src: string) {
    return i + 2 < src.length && src[i] === '!' && src[i + 1] === '-' && src[i + 2] === '-';
  }

  public isClosingComment(i: number, src: string) {
    return i + 1 < src.length && src[i] === '-' && src[i + 1] === '>';
  }

  public extractLinks(src: string): HyperLink[] {
    const list: HyperLink[] = [];

    let type: CapturingType = 'none';
    let text = "";

    for (let i = 0; i < src.length; i++) {
      switch (src[i]) {
        case "<": {
          text = "";

          if (this.isOpeningComment(i + 1, src)) {
            type = 'comment';
          }

          if (type !== 'comment') {
            type = 'tag';
            tag = {};
            break;
          }
        }
        case ">": {
          if (type === 'tag') {
            type = 'none';
          }
          break;
        }
        case "-": {
          if (type === 'comment' && this.isClosingComment(i + 1, src)) {
            type = 'none';
            break;
          }
        }
        default: {
          if (type === 'tag') {
            if (!text.length && src[i] === '/') {
              type = 'closed-tag';
            } else {
              text += src[i];
            }
          }
        }
      }
    }

    return list;
  }

  public parseAttributes() {

  }
};

export default new Parser();