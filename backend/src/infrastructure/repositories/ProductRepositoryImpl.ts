import { ProductRepository } from '../../domain/ports/ProductRepository';
import { Product, CreateProductDTO, UpdateProductDTO } from '../../domain/entities/Product';
import { prisma } from '../database/prisma';

interface PrismaProduct {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  minStock: number;
  currentStock: number;
  unit: string;
  category: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function mapToProduct(product: PrismaProduct): Product {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    sku: product.sku,
    minStock: product.minStock,
    currentStock: product.currentStock,
    unit: product.unit,
    category: product.category,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export class PrismaProductRepository implements ProductRepository {
  async findById(id: string): Promise<Product | null> {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return null;
    return mapToProduct(product);
  }

  async findBySku(sku: string): Promise<Product | null> {
    const product = await prisma.product.findUnique({ where: { sku } });
    if (!product) return null;
    return mapToProduct(product);
  }

  async findAll(): Promise<Product[]> {
    const products = await prisma.product.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    return products.map(mapToProduct);
  }

async findLowStock(): Promise<Product[]> {
    const products = await prisma.product.findMany({
      orderBy: { currentStock: 'asc' },
    });
    return products
      .map(mapToProduct)
      .filter(p => p.currentStock <= p.minStock);
  }

  async create(data: CreateProductDTO): Promise<Product> {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        sku: data.sku,
        minStock: data.minStock,
        currentStock: 0,
        unit: data.unit ?? 'units',
        category: data.category,
      },
    });
    return mapToProduct(product);
  }

  async update(id: string, data: UpdateProductDTO): Promise<Product | null> {
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        minStock: data.minStock,
        unit: data.unit,
        category: data.category,
      },
    });
    return mapToProduct(product);
  }

  async updateStock(id: string, quantity: number): Promise<Product | null> {
    const product = await prisma.product.update({
      where: { id },
      data: { currentStock: quantity },
    });
    return mapToProduct(product);
  }

async delete(id: string): Promise<boolean> {
    try {
      
      await prisma.$executeRaw`DELETE FROM Movement WHERE productId = ${id}`;
      await prisma.$executeRaw`DELETE FROM Alert WHERE productId = ${id}`;
      await prisma.$executeRaw`DELETE FROM Product WHERE id = ${id}`;
      return true;
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  }
}
