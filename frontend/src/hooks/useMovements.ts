import { useState, useCallback } from 'react';
import { Movement, ApiResponse, MovementResult, Product } from '../types';

interface UseMovementsReturn {
  loading: boolean;
  error: string | null;
  registerMovement: (productId: string, type: 'ENTRY' | 'EXIT', quantity: number, reason?: string) => Promise<MovementResult | null>;
}

const API_BASE = '/api';

export function useMovements(): UseMovementsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerMovement = useCallback(async (
    productId: string,
    type: 'ENTRY' | 'EXIT',
    quantity: number,
    reason?: string
  ): Promise<MovementResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/movements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          type,
          quantity,
          reason,
        }),
      });
      const result: ApiResponse<MovementResult> = await response.json();
      if (result.success) {
        return result.data;
      } else {
        setError(result.error || 'Failed to register movement');
        return null;
      }
    } catch (err) {
      setError('Network error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    registerMovement,
  };
}
