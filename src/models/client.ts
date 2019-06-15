import * as WebSocket from 'ws';

export class Client {
  public ws: WebSocket;

  public init() {
    console.log('Initializing client!');

    this.ws = new WebSocket('ws://localhost:8000');
    this.ws.on('open', this.onOpen);

    setTimeout(() => {
      this.ws.send('Hello world!');
    }, 2500);
  }

  public onOpen() {
    console.log('Connected!');
  }
}
