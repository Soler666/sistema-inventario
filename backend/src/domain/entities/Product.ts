export interface Product {
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

export interface CreateProductDTO {
  name: string;
  description?: string;
  sku: string;
  minStock: number;
  unit?: string;
  category?: string;
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  minStock?: number;
  unit?: string;
  category?: string;
}

export function createProduct(data: CreateProductDTO): Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { currentStock: number } {
  return {
    name: data.name,
    description: data.description ?? null,
    sku: data.sku,
    minStock: data.minStock,
    currentStock: 0,
    unit: data.unit ?? 'units',
    category: data.category ?? null,
  };
}

export function isStockCritical(product: Product): boolean {
  return product.currentStock <= product.minStock;
}

export function calculateStockLevel(product: Product): 'critical' | 'warning' | 'healthy' {
  const ratio = product.currentStock / product.minStock;
  if (ratio <= 1) return 'critical';
  if (ratio <= 1.5) return 'warning';
  return 'healthy';
}
