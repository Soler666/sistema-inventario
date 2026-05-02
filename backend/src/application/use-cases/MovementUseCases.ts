import { ProductRepository } from '../../domain/ports/ProductRepository';
import { MovementRepository } from '../../domain/ports/MovementRepository';
import { AlertRepository } from '../../domain/ports/AlertRepository';
import { 
  Movement, 
  CreateMovementDTO, 
  calculateNewStock, 
  validateMovement as validateMovementEntity 
} from '../../domain/entities/Movement';
import { 
  Alert, 
  CreateAlertDTO, 
  createAlertEntity, 
  generateAlertMessage 
} from '../../domain/entities/Alert';
import { isStockCritical, calculateStockLevel } from '../../domain/entities/Product';
import { broadcastMovement, broadcastAlert } from '../../infrastructure/sockets/socketIO';

export interface StockValidationResult {
  isValid: boolean;
  error?: string;
  previousStock: number;
  newStock: number;
  alertGenerated?: Alert;
}

export class MovementService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly movementRepository: MovementRepository,
    private readonly alertRepository: AlertRepository
  ) {}

  async registerMovement(data: CreateMovementDTO): Promise<StockValidationResult> {
    const product = await this.productRepository.findById(data.productId);
    if (!product) {
      return {
        isValid: false,
        error: 'PRODUCT_NOT_FOUND',
        previousStock: 0,
        newStock: 0,
      };
    }

    const validation = validateMovementEntity(product.currentStock, data);
    if (!validation.valid) {
      return {
        isValid: false,
        error: validation.error,
        previousStock: product.currentStock,
        newStock: product.currentStock,
      };
    }

    const newStock = calculateNewStock(product.currentStock, data);
    await this.productRepository.updateStock(data.productId, newStock);
    
    const movement = await this.movementRepository.create({
      productId: data.productId,
      type: data.type,
      quantity: data.quantity,
      reason: data.reason,
    });

    broadcastMovement({
      ...movement,
      product: { name: product.name, sku: product.sku },
      previousStock: product.currentStock,
      newStock,
    });

    let alertGenerated: Alert | undefined;
    if (isStockCritical({ ...product, currentStock: newStock })) {
      const existingAlerts = await this.alertRepository.findByProductId(data.productId);
      const hasUnresolvedAlert = existingAlerts.some(a => !a.resolved);
      
      if (!hasUnresolvedAlert) {
        const alertType = newStock === 0 ? 'OUT_OF_STOCK' : 'CRITICAL_STOCK';
        const alertMessage = generateAlertMessage(product.name, newStock, product.minStock);
        
        const alertDTO: CreateAlertDTO = {
          productId: data.productId,
          type: alertType,
          message: alertMessage,
        };
        
        alertGenerated = await this.alertRepository.create(alertDTO);
        broadcastAlert({
          ...alertGenerated,
          product: { name: product.name, sku: product.sku },
        });
      }
    }

    return {
      isValid: true,
      previousStock: product.currentStock,
      newStock,
      alertGenerated,
    };
  }

  async getMovementsByProduct(productId: string): Promise<Movement[]> {
    return this.movementRepository.findByProductId(productId);
  }

  async getAllMovements() {
    return this.movementRepository.findAll();
  }

  async getProductStockHistory(productId: string): Promise<{
    productId: string;
    movements: Movement[];
    currentStock: number;
  }> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND');
    }
    
    const movements = await this.movementRepository.findByProductId(productId);
    
    return {
      productId,
      movements,
      currentStock: product.currentStock,
    };
  }
}

export function validateStockOperation(
  currentStock: number,
  requestedQuantity: number,
  operation: 'ENTRY' | 'EXIT'
): { valid: boolean; error?: string } {
  if (requestedQuantity <= 0) {
    return { valid: false, error: 'QUANTITY_MUST_BE_POSITIVE' };
  }

  if (operation === 'EXIT') {
    if (requestedQuantity > currentStock) {
      return { valid: false, error: 'INSUFFICIENT_STOCK' };
    }

    const stockAfterOperation = currentStock - requestedQuantity;
    if (stockAfterOperation < 0) {
      return { valid: false, error: 'NEGATIVE_STOCK_NOT_ALLOWED' };
    }
  }

  if (operation === 'ENTRY') {
    const maxStock = currentStock * 2;
    if (requestedQuantity > maxStock && currentStock > 0) {
      return { valid: false, error: 'ENTRY_QUANTITY_UNUSUALLY_HIGH' };
    }
  }

  return { valid: true };
}
