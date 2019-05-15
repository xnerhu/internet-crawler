import { Token } from "./token";
import { HTMLElement, HTMLElementType, HTMLElementAttributesMap } from "./html-element";

export default class Parser {
  static tokenize(src: string): Token[] {
    let list: Token[] = [];
    let capturing = false;
    let text = "";

    for (let i = 0; i < src.length; i++) {
      if (src[i] === '<' && !capturing) {
        capturing = true;
        text = "";
      } else if (src[i] === '>' && capturing) {
        capturing = false;
        list.push(text.trimRight() + '>');
      }

      if (capturing) {
        text += src[i];
      }
    }

    return list;
  }

  static parseToken(token: Token): HTMLElement {
    if (token.length < 3) return null;

    let tag: HTMLElement = {
      type: this._getTagType(token),
      tagName: this._getTagName(token),
      attributes: {},
    };

    if (tag.type !== HTMLElementType.Closing) {
      tag.attributes = this._parseAttributes(token, tag.tagName, tag.type);
    }

    return tag;
  }

  private static _getTagType(token: Token): HTMLElementType {
    if (token[token.length - 2] === '/') return HTMLElementType.SelfClosing;
    if (token[1] === '/') return HTMLElementType.Closing;
    return HTMLElementType.Opening;
  }

  private static _getTagName(token: Token): any {
    let tagName = '';

    for (let i = 1; i < token.length; i++) {
      if (token[i] === ' ' || i === token.length - 1) {
        return tagName.toLowerCase();
      } else if (token[i] !== '<' && token[i] !== '/') {
        tagName += token[i];
      }
    }
  }

  private static _parseAttributes(token: Token, tagName?: string, tagType?: HTMLElementType): HTMLElementAttributesMap {
    if (tagName == null) tagName = this._getTagName(token);
    if (tagType == null) tagType = this._getTagType(token);

    const map: HTMLElementAttributesMap = {};
    let capturingValue = false;
    let property = "";
    let text = "";
    let length = token.length;

    if (tagType === HTMLElementType.SelfClosing) {
      length--;
    }

    for (let i = tagName.length + 2; i < length; i++) {
      if (!capturingValue && text.length && (token[i] === ' ' || token[i] === '=' || i === token.length - 1)) {
        if (token[i] === '=') {
          capturingValue = true;
          i++;
        }

        property = text.toLowerCase();
        map[property] = "";
        text = "";
      } else if (capturingValue && (token[i] === '"')) {
        capturingValue = false;
        map[property] = text;
        text = "";
      } else if (token[i] !== ' ' || capturingValue) {
        text += token[i];
      }
    }

    return map;
  }
}
