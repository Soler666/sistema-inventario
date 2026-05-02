import { MovementRepository, MovementWithProduct } from '../../domain/ports/MovementRepository';
import { Movement, CreateMovementDTO } from '../../domain/entities/Movement';
import { prisma } from '../database/prisma';

interface PrismaMovement {
  id: string;
  productId: string;
  type: string;
  quantity: number;
  reason: string | null;
  createdAt: Date;
  product?: {
    name: string;
    sku: string;
  };
}

function mapToMovement(movement: PrismaMovement): Movement {
  return {
    id: movement.id,
    productId: movement.productId,
    type: movement.type as 'ENTRY' | 'EXIT',
    quantity: movement.quantity,
    reason: movement.reason,
    createdAt: movement.createdAt,
  };
}

function mapToMovementWithProduct(movement: PrismaMovement): MovementWithProduct {
  return {
    id: movement.id,
    productId: movement.productId,
    type: movement.type as 'ENTRY' | 'EXIT',
    quantity: movement.quantity,
    reason: movement.reason,
    createdAt: movement.createdAt,
    product: movement.product ? {
      name: movement.product.name,
      sku: movement.product.sku,
    } : undefined,
  };
}

export class PrismaMovementRepository implements MovementRepository {
  async findById(id: string): Promise<Movement | null> {
    const movement = await prisma.movement.findUnique({ where: { id } });
    if (!movement) return null;
    return mapToMovement(movement);
  }

  async findByProductId(productId: string): Promise<Movement[]> {
    const movements = await prisma.movement.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });
    return movements.map(mapToMovement);
  }

  async findAll(): Promise<MovementWithProduct[]> {
    const movements = await prisma.movement.findMany({
      include: {
        product: {
          select: { name: true, sku: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return movements.map(mapToMovementWithProduct);
  }

  async create(data: CreateMovementDTO): Promise<Movement> {
    const movement = await prisma.movement.create({
      data: {
        productId: data.productId,
        type: data.type,
        quantity: data.quantity,
        reason: data.reason,
      },
    });
    return mapToMovement(movement);
  }
}
