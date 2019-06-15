import * as WebSocket from 'ws';

export class Client {
  public ws: WebSocket;

  public init() {
    console.log('Initializing client!');

    this.ws = new WebSocket('ws://localhost:7000');
    this.ws.on('open', this.onOpen);
    this.ws.on('message', this.onMessage);
  }

  public onOpen() {
    console.log('Connected!');
  }

  public onMessage(data: string) {

  }
}
