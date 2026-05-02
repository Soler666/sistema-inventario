import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

let ioInstance: SocketIOServer | null = null;

export function initializeSocketIO(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`Cliente desconectado: ${socket.id}`);
    });

    socket.on('subscribe_alerts', () => {
      socket.join('alerts');
    });

    socket.on('subscribe_movements', () => {
      socket.join('movements');
    });

    socket.on('subscribe_reports', () => {
      socket.join('reports');
    });
  });

  ioInstance = io;
  return io;
}

export function getSocketIO(): SocketIOServer {
  if (!ioInstance) {
    throw new Error('Socket.IO no ha sido inicializado');
  }
  return ioInstance;
}

export function broadcastAlert(alert: any) {
  if (ioInstance) {
    ioInstance.to('alerts').emit('new_alert', alert);
    ioInstance.to('alerts').emit('alert_update', alert);
  }
}

export function broadcastMovement(movement: any) {
  if (ioInstance) {
    ioInstance.to('movements').emit('new_movement', movement);
  }
}

export function broadcastReportUpdate(data: any) {
  if (ioInstance) {
    ioInstance.to('reports').emit('report_update', data);
  }
}
