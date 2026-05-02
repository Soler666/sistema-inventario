import { Product, CreateProductDTO, UpdateProductDTO } from '../entities/Product';

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySku(sku: string): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  findLowStock(): Promise<Product[]>;
  create(data: CreateProductDTO): Promise<Product>;
  update(id: string, data: UpdateProductDTO): Promise<Product | null>;
  updateStock(id: string, quantity: number): Promise<Product | null>;
  delete(id: string): Promise<boolean>;
}
