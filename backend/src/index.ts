import http from 'http';
import app from './config/server';
import { prisma } from './infrastructure/database/prisma';
import { initializeSocketIO } from './infrastructure/sockets/socketIO';

const PORT = process.env.PORT || 3001;

async function startServer(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');

    const httpServer = http.createServer(app);
    initializeSocketIO(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
