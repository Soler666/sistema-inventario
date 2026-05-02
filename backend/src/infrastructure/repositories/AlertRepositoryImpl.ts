import { AlertRepository } from '../../domain/ports/AlertRepository';
import { Alert, CreateAlertDTO } from '../../domain/entities/Alert';
import { prisma } from '../database/prisma';

interface PrismaAlert {
  id: string;
  productId: string;
  type: string;
  message: string;
  resolved: boolean;
  createdAt: Date;
  resolvedAt: Date | null;
}

function mapToAlert(alert: PrismaAlert): Alert {
  return {
    id: alert.id,
    productId: alert.productId,
    type: alert.type as 'CRITICAL_STOCK' | 'OUT_OF_STOCK',
    message: alert.message,
    resolved: alert.resolved,
    createdAt: alert.createdAt,
    resolvedAt: alert.resolvedAt,
  };
}

export class PrismaAlertRepository implements AlertRepository {
  async findById(id: string): Promise<Alert | null> {
    const alert = await prisma.alert.findUnique({ where: { id } });
    if (!alert) return null;
    return mapToAlert(alert);
  }

  async findByProductId(productId: string): Promise<Alert[]> {
    const alerts = await prisma.alert.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });
    return alerts.map(mapToAlert);
  }

  async findActive(): Promise<Alert[]> {
    const alerts = await prisma.alert.findMany({
      where: { resolved: false },
      orderBy: { createdAt: 'desc' },
    });
    return alerts.map(mapToAlert);
  }

  async create(data: CreateAlertDTO): Promise<Alert> {
    const alert = await prisma.alert.create({
      data: {
        productId: data.productId,
        type: data.type,
        message: data.message,
        resolved: false,
      },
    });
    return mapToAlert(alert);
  }

  async resolve(id: string): Promise<Alert | null> {
    const alert = await prisma.alert.update({
      where: { id },
      data: {
        resolved: true,
        resolvedAt: new Date(),
      },
    });
    return mapToAlert(alert);
  }
}
