export enum HTMLElementType {
  Opening,
  Closing,
  SelfClosing,
}

export interface HTMLElement {
  tagName?: string;
  type?: HTMLElementType;
  attributes?: HTMLElementAttributesMap;
}

export interface HTMLElementAttributesMap {
  [key: string]: string;
}

export type Token = string;
