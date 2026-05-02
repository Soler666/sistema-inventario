import { useState, useEffect, useCallback } from 'react';

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

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

const API_BASE = '/api';

export function useProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recargarProductos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/products`);
      const result: ApiResponse<Producto[]> = await response.json();
      if (result.success) {
        setProductos(result.data);
      } else {
        setError(result.error || 'Error al cargar productos');
      }
    } catch (err) {
      setError('Error de red');
    } finally {
      setCargando(false);
    }
  }, []);

const crearProducto = useCallback(async (data: Partial<Producto>): Promise<Producto | null> => {
    setCargando(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result: ApiResponse<Producto> = await response.json();
      if (result.success) {
        await recargarProductos();
        return result.data;
      } else {
        setError(result.error || 'Error al crear producto');
        return null;
      }
    } catch (err) {
      setError('Error de red');
      return null;
    } finally {
      setCargando(false);
    }
  }, [recargarProductos]);

const actualizarProducto = useCallback(async (id: string, data: Partial<Producto>): Promise<Producto | null> => {
    setCargando(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result: ApiResponse<Producto> = await response.json();
      if (result.success) {
        await recargarProductos();
        return result.data;
      } else {
        setError(result.error || 'Error al actualizar producto');
        return null;
      }
    } catch (err) {
      setError('Error de red');
      return null;
    } finally {
      setCargando(false);
    }
  }, [recargarProductos]);

const eliminarProducto = useCallback(async (id: string): Promise<boolean> => {
    setCargando(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
      });
      const result: ApiResponse<null> = await response.json();
      if (result.success) {
        await recargarProductos();
        return true;
      } else {
        setError(result.error || 'Error al eliminar producto');
        return false;
      }
    } catch (err) {
      setError('Error de red');
      return false;
    } finally {
      setCargando(false);
    }
  }, [recargarProductos]);

  useEffect(() => {
    recargarProductos();
  }, [recargarProductos]);

  return {
    productos,
    cargando,
    error,
    recargarProductos,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
  };
}

export function obtenerNivelStock(producto: Producto): 'critico' | 'bajo' | 'normal' {
  const ratio = producto.currentStock / producto.minStock;
  if (ratio <= 1) return 'critico';
  if (ratio <= 1.5) return 'bajo';
  return 'normal';
}
