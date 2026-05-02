export interface Alert {
  id: string;
  productId: string;
  type: 'CRITICAL_STOCK' | 'OUT_OF_STOCK';
  message: string;
  resolved: boolean;
  createdAt: Date;
  resolvedAt: Date | null;
}

export interface CreateAlertDTO {
  productId: string;
  type: 'CRITICAL_STOCK' | 'OUT_OF_STOCK';
  message: string;
}

export function createAlertEntity(data: CreateAlertDTO): Omit<Alert, 'id' | 'createdAt' | 'resolvedAt'> {
  return {
    productId: data.productId,
    type: data.type,
    message: data.message,
    resolved: false,
  };
}

export function generateAlertMessage(productName: string, currentStock: number, minStock: number): string {
  if (currentStock === 0) {
    return `${productName} está agotado`;
  }
  return `${productName} ha alcanzado nivel de stock crítico: ${currentStock}/${minStock}`;
}
