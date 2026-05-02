import { Request, Response } from 'express';
import { MovementService } from '../../application/use-cases/MovementUseCases';
import { CreateMovementDTO } from '../../domain/entities/Movement';

export class MovementController {
  constructor(private readonly movementService: MovementService) {}

  async registerMovement(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateMovementDTO = req.body;
      
      if (!data.productId || !data.type || !data.quantity) {
        res.status(400).json({ success: false, error: 'INVALID_DATA' });
        return;
      }
      
      if (!['ENTRY', 'EXIT'].includes(data.type)) {
        res.status(400).json({ success: false, error: 'INVALID_MOVEMENT_TYPE' });
        return;
      }
      
      const result = await this.movementService.registerMovement(data);
      
      if (!result.isValid) {
        res.status(400).json({ success: false, error: result.error });
        return;
      }
      
      res.status(201).json({ 
        success: true, 
        data: {
          previousStock: result.previousStock,
          newStock: result.newStock,
          alertGenerated: result.alertGenerated,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: 'MOVEMENT_FAILED' });
    }
  }

  async getMovementsByProduct(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const movements = await this.movementService.getMovementsByProduct(productId);
      res.json({ success: true, data: movements });
    } catch (error) {
      res.status(500).json({ success: false, error: 'FETCH_FAILED' });
    }
  }

  async getAllMovements(_req: Request, res: Response): Promise<void> {
    try {
      const movements = await this.movementService.getAllMovements();
      res.json({ success: true, data: movements });
    } catch (error) {
      res.status(500).json({ success: false, error: 'FETCH_FAILED' });
    }
  }

  async getProductStockHistory(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const history = await this.movementService.getProductStockHistory(productId);
      res.json({ success: true, data: history });
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'PRODUCT_NOT_FOUND') {
        res.status(404).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'FETCH_FAILED' });
    }
  }
}
