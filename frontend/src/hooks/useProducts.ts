import { useState, useEffect, useCallback } from 'react';
import { Product, ApiResponse } from '../types';

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  createProduct: (data: Partial<Product>) => Promise<Product | null>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<Product | null>;
  deleteProduct: (id: string) => Promise<boolean>;
}

const API_BASE = '/api';

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/products`);
      const result: ApiResponse<Product[]> = await response.json();
      if (result.success) {
        setProducts(result.data);
      } else {
        setError(result.error || 'Failed to fetch products');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (data: Partial<Product>): Promise<Product | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result: ApiResponse<Product> = await response.json();
      if (result.success) {
        await fetchProducts();
        return result.data;
      } else {
        setError(result.error || 'Failed to create product');
        return null;
      }
    } catch (err) {
      setError('Network error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  const updateProduct = useCallback(async (id: string, data: Partial<Product>): Promise<Product | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result: ApiResponse<Product> = await response.json();
      if (result.success) {
        await fetchProducts();
        return result.data;
      } else {
        setError(result.error || 'Failed to update product');
        return null;
      }
    } catch (err) {
      setError('Network error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
      });
      const result: ApiResponse<null> = await response.json();
      if (result.success) {
        await fetchProducts();
        return true;
      } else {
        setError(result.error || 'Failed to delete product');
        return false;
      }
    } catch (err) {
      setError('Network error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}

export function getStockLevel(product: Product): 'critical' | 'warning' | 'healthy' {
  const ratio = product.currentStock / product.minStock;
  if (ratio <= 1) return 'critical';
  if (ratio <= 1.5) return 'warning';
  return 'healthy';
}
