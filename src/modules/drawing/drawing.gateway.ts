import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface DrawEvent {
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: string;
  size: number;
}

@WebSocketGateway({ cors: { origin: '*' } })
export class DrawingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private canvas: DrawEvent[] = [];

  handleConnection(socket: Socket) {
    const name = socket.handshake.query.name?.toString() || '';
    const canvasForNewUser =
      socket.handshake.query.canvasForNewUser == 'false' ? false : true;
    socket.broadcast.emit('notify', `User ${name} has Joined`);
    if (canvasForNewUser) {
      socket.emit('canvas', this.canvas);
    }
    this.server.emit('count', this.server.sockets.sockets.size);
  }

  handleDisconnect(socket: Socket) {
    const name = socket.handshake.query.name?.toString() || '';

    if (name) {
      this.server.emit('notify', `User ${name} has Disconnected`);
      this.server.emit('count', this.server.sockets.sockets.size);
    }
  }

  @SubscribeMessage('notify')
  notify(@ConnectedSocket() client: Socket, @MessageBody() payload: any) {
    client.broadcast.emit('notify', payload);
  }

  @SubscribeMessage('count')
  count(@ConnectedSocket() client: Socket) {
    client.broadcast.emit('count', this.server.sockets.sockets.size);
  }

  @SubscribeMessage('clear')
  clearCanvas(@ConnectedSocket() client: Socket) {
    this.canvas = [];
    client.broadcast.emit('clear');
  }

  @SubscribeMessage('startDrawing')
  handleStartDrawing(
    @ConnectedSocket() client: Socket,
    @MessageBody() drawData: DrawEvent,
  ) {
    client.broadcast.emit('startDrawing', drawData);
  }

  @SubscribeMessage('drawing')
  handleDrawing(
    @ConnectedSocket() client: Socket,
    @MessageBody() drawData: DrawEvent,
  ) {
    this.canvas.push(drawData);
    client.broadcast.emit('drawing', drawData);
  }
}
