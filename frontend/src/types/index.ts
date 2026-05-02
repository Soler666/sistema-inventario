export interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  minStock: number;
  currentStock: number;
  unit: string;
  category: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Movement {
  id: string;
  productId: string;
  type: 'ENTRY' | 'EXIT';
  quantity: number;
  reason: string | null;
  createdAt: string;
}

export interface Alert {
  id: string;
  productId: string;
  type: 'CRITICAL_STOCK' | 'OUT_OF_STOCK';
  message: string;
  resolved: boolean;
  createdAt: string;
  resolvedAt: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface StockStatus {
  isCritical: boolean;
  product: Product;
}

export interface MovementResult {
  previousStock: number;
  newStock: number;
  alertGenerated?: Alert;
}

export interface DashboardAlerts {
  active: Alert[];
  resolved: number;
  total: number;
}
