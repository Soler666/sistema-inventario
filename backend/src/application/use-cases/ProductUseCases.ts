import { ProductRepository } from '../../domain/ports/ProductRepository';
import { 
  Product, 
  CreateProductDTO, 
  UpdateProductDTO, 
  createProduct as createProductEntity,
  isStockCritical 
} from '../../domain/entities/Product';

export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async getProductById(id: string): Promise<Product | null> {
    return this.productRepository.findById(id);
  }

  async getAllProducts(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  async getLowStockProducts(): Promise<Product[]> {
    return this.productRepository.findLowStock();
  }

  async createProduct(data: CreateProductDTO): Promise<Product> {
    const existingProduct = await this.productRepository.findBySku(data.sku);
    if (existingProduct) {
      throw new Error('PRODUCT_ALREADY_EXISTS');
    }
    
    const productEntity = createProductEntity(data);
    return this.productRepository.create({
      name: productEntity.name,
      description: productEntity.description ?? undefined,
      sku: productEntity.sku,
      minStock: productEntity.minStock,
      unit: productEntity.unit,
      category: productEntity.category ?? undefined,
    });
  }

  async updateProduct(id: string, data: UpdateProductDTO): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND');
    }
    
    const updated = await this.productRepository.update(id, data);
    if (!updated) {
      throw new Error('UPDATE_FAILED');
    }
    
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND');
    }
    
    return this.productRepository.delete(id);
  }

  async checkStockStatus(productId: string): Promise<{ isCritical: boolean; product: Product }> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND');
    }
    
    return {
      isCritical: isStockCritical(product),
      product,
    };
  }
}
