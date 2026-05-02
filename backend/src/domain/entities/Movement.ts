export interface Movement {
  id: string;
  productId: string;
  type: 'ENTRY' | 'EXIT';
  quantity: number;
  reason: string | null;
  createdAt: Date;
}

export interface CreateMovementDTO {
  productId: string;
  type: 'ENTRY' | 'EXIT';
  quantity: number;
  reason?: string;
}

export function calculateNewStock(currentStock: number, movement: CreateMovementDTO): number {
  if (movement.type === 'ENTRY') {
    return currentStock + movement.quantity;
  }
  return Math.max(0, currentStock - movement.quantity);
}

export function validateMovement(currentStock: number, movement: CreateMovementDTO): { valid: boolean; error?: string } {
  if (movement.quantity <= 0) {
    return { valid: false, error: 'Quantity must be greater than zero' };
  }
  
  if (movement.type === 'EXIT' && movement.quantity > currentStock) {
    return { valid: false, error: 'Insufficient stock available' };
  }
  
  return { valid: true };
}
