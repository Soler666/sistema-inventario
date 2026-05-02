export interface Producto {
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

export interface Movimiento {
  id: string;
  productId: string;
  type: 'ENTRY' | 'EXIT';
  quantity: number;
  reason: string | null;
  createdAt: string;
  product?: {
    name: string;
    sku: string;
  };
}

export interface Alerta {
  id: string;
  productId: string;
  type: 'CRITICAL_STOCK' | 'OUT_OF_STOCK';
  message: string;
  resolved: boolean;
  createdAt: string;
  resolvedAt: string | null;
  product?: {
    name: string;
    sku: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface ResultadoMovimiento {
  previousStock: number;
  newStock: number;
  alertGenerated?: Alerta;
}

export interface DashboardAlertas {
  active: Alerta[];
  resolved: number;
  total: number;
}
