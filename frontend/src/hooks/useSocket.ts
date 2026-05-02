import { useEffect, useState, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';

interface UseSocketReturn {
  isConnected: boolean;
  onNewAlert: (callback: (alert: any) => void) => void;
  onNewMovement: (callback: (movement: any) => void) => void;
  onReportUpdate: (callback: (data: any) => void) => void;
}

let socket: Socket | null = null;

export function useSocket(): UseSocketReturn {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (socket) return;

    const socketURL = import.meta.env.MODE === 'development'
      ? 'http://localhost:3001'
      : window.location.origin;

    socket = io(socketURL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('Socket conectado');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket desconectado');
      setIsConnected(false);
    });

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, []);

  const onNewAlert = useCallback((callback: (alert: any) => void) => {
    if (socket) {
      socket.on('new_alert', callback);
      socket.emit('subscribe_alerts');
      return () => {
        if (socket) {
          socket.off('new_alert', callback);
        }
      };
    }
  }, []);

  const onNewMovement = useCallback((callback: (movement: any) => void) => {
    if (socket) {
      socket.on('new_movement', callback);
      socket.emit('subscribe_movements');
      return () => {
        if (socket) {
          socket.off('new_movement', callback);
        }
      };
    }
  }, []);

  const onReportUpdate = useCallback((callback: (data: any) => void) => {
    if (socket) {
      socket.on('report_update', callback);
      socket.emit('subscribe_reports');
      return () => {
        if (socket) {
          socket.off('report_update', callback);
        }
      };
    }
  }, []);

  return {
    isConnected,
    onNewAlert,
    onNewMovement,
    onReportUpdate,
  };
}
