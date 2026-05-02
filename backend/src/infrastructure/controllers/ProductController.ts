import { Request, Response } from 'express';
import { ProductService } from '../../application/use-cases/ProductUseCases';
import { CreateProductDTO, UpdateProductDTO } from '../../domain/entities/Product';

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  async getAllProducts(_req: Request, res: Response): Promise<void> {
    try {
      const products = await this.productService.getAllProducts();
      res.json({ success: true, data: products });
    } catch (error) {
      res.status(500).json({ success: false, error: 'FETCH_FAILED' });
    }
  }

  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await this.productService.getProductById(id);
      
      if (!product) {
        res.status(404).json({ success: false, error: 'PRODUCT_NOT_FOUND' });
        return;
      }
      
      res.json({ success: true, data: product });
    } catch (error) {
      res.status(500).json({ success: false, error: 'FETCH_FAILED' });
    }
  }

  async getLowStockProducts(_req: Request, res: Response): Promise<void> {
    try {
      const products = await this.productService.getLowStockProducts();
      res.json({ success: true, data: products });
    } catch (error) {
      res.status(500).json({ success: false, error: 'FETCH_FAILED' });
    }
  }

  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateProductDTO = req.body;
      
      if (!data.name || !data.sku || data.minStock === undefined) {
        res.status(400).json({ success: false, error: 'INVALID_DATA' });
        return;
      }
      
      const product = await this.productService.createProduct(data);
      res.status(201).json({ success: true, data: product });
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'PRODUCT_ALREADY_EXISTS') {
        res.status(409).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'CREATE_FAILED' });
    }
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateProductDTO = req.body;
      
      const product = await this.productService.updateProduct(id, data);
      res.json({ success: true, data: product });
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'PRODUCT_NOT_FOUND') {
        res.status(404).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'UPDATE_FAILED' });
    }
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.productService.deleteProduct(id);
      res.json({ success: true, data: null });
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'PRODUCT_NOT_FOUND') {
        res.status(404).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'DELETE_FAILED' });
    }
  }

  async checkStockStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.productService.checkStockStatus(id);
      res.json({ success: true, data: result });
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'PRODUCT_NOT_FOUND') {
        res.status(404).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'CHECK_FAILED' });
    }
  }
}
