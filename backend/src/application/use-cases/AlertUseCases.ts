import { AlertRepository } from '../../domain/ports/AlertRepository';
import { ProductRepository } from '../../domain/ports/ProductRepository';
import { Alert, CreateAlertDTO } from '../../domain/entities/Alert';
import { isStockCritical } from '../../domain/entities/Product';

export class AlertService {
  constructor(
    private readonly alertRepository: AlertRepository,
    private readonly productRepository: ProductRepository
  ) {}

  async getActiveAlerts(): Promise<Alert[]> {
    return this.alertRepository.findActive();
  }

  async getAlertsByProduct(productId: string): Promise<Alert[]> {
    return this.alertRepository.findByProductId(productId);
  }

  async resolveAlert(alertId: string): Promise<Alert> {
    const alert = await this.alertRepository.findById(alertId);
    if (!alert) {
      throw new Error('ALERT_NOT_FOUND');
    }
    
    const resolved = await this.alertRepository.resolve(alertId);
    if (!resolved) {
      throw new Error('RESOLVE_FAILED');
    }
    
    return resolved;
  }

  async checkAndGenerateAlerts(productId: string): Promise<Alert | null> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND');
    }
    
    if (!isStockCritical(product)) {
      return null;
    }
    
    const existingAlerts = await this.alertRepository.findByProductId(productId);
    const hasUnresolvedAlert = existingAlerts.some(a => !a.resolved);
    
    if (hasUnresolvedAlert) {
      return null;
    }
    
const alertType = product.currentStock === 0 ? 'OUT_OF_STOCK' : 'CRITICAL_STOCK';
    const message = product.currentStock === 0
      ? `${product.name} está agotado`
      : `${product.name} ha alcanzado nivel de stock crítico: ${product.currentStock}/${product.minStock}`;
    
    const alertDTO: CreateAlertDTO = {
      productId,
      type: alertType,
      message,
    };
    
    return this.alertRepository.create(alertDTO);
  }

  async getAllAlertsForDashboard(): Promise<{
    active: Alert[];
    resolved: number;
    total: number;
  }> {
    const active = await this.alertRepository.findActive();
    const allAlerts = active;
    
    return {
      active,
      resolved: allAlerts.filter(a => a.resolved).length,
      total: allAlerts.length,
    };
  }
}
