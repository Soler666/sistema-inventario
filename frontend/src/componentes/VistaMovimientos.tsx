import { useState, useEffect } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, RotateCw, Plus, Package, RefreshCw } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';

interface Movimiento {
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

export function VistaMovimientos() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [tipoMovimiento, setTipoMovimiento] = useState<'ENTRY' | 'EXIT'>('ENTRY');
  const [cantidad, setCantidad] = useState('');
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');
  const { isConnected, onNewMovement } = useSocket();

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    const unsubscribe = onNewMovement((movement) => {
      setMovimientos(prev => [movement, ...prev]);
    });
    return unsubscribe;
  }, [onNewMovement]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [prodRes, movRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/movements'),
      ]);
      const prodData = await prodRes.json();
      const movData = await movRes.json();
      
      if (prodData.success) setProductos(prodData.data);
      if (movData.success) setMovimientos(movData.data);
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  };

  const registrarMovimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!productoSeleccionado) {
      setError('Selecciona un producto');
      return;
    }
    
    const cant = parseInt(cantidad, 10);
    if (isNaN(cant) || cant <= 0) {
      setError('Ingresa una cantidad válida');
      return;
    }
    
    try {
      const res = await fetch('/api/movimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: productoSeleccionado,
          type: tipoMovimiento,
          quantity: cant,
          reason: motivo || undefined,
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        setMostrarModal(false);
        cargarDatos();
        setProductoSeleccionado('');
        setCantidad('');
        setMotivo('');
      } else {
        setError(data.error || 'Error al registrar movimiento');
      }
    } catch {
      setError('Error de conexión');
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
<div className="flex-1 p-4 md:p-8 bg-slate-50 overflow-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:justify-between mb-6 md:mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Movimientos de Inventario</h2>
            <p className="text-slate-500 mt-1">Registra entradas y salidas de productos</p>
            {isConnected && (
              <span className="inline-block mt-2 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-semibold">
                ● En tiempo real
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={cargarDatos}
              className="flex items-center gap-2 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition-all"
            >
              <RefreshCw size={18} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
            <button
              onClick={() => setMostrarModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/25"
            >
              <span className="text-xl">+</span>
              <span className="hidden md:inline">Nuevo Movimiento</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {cargando ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
) : movimientos.length === 0 ? (
            <div className="text-center py-16">
              <RotateCw className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl font-semibold text-slate-700">Sin movimientos</h3>
              <p className="text-slate-500 mt-2">Registra tu primer movimiento de inventario</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Fecha</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Producto</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Tipo</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">Cantidad</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movimientos.map((mov) => (
                  <tr key={mov.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-600">
{formatearFecha(mov.createdAt)}
                    </td>
<td className="px-6 py-4">
                      <div>
<p className="font-semibold text-slate-800">{mov.product?.name || 'Producto'}</p>
<p className="text-xs text-slate-500">SKU: {mov.product?.sku}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
<span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        mov.type === 'ENTRY' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {mov.type === 'ENTRY' ? 'ENTRADA' : 'SALIDA'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-800">
                      {mov.type === 'ENTRY' ? '+' : '-'}{mov.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {mov.reason || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {mostrarModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white">Nuevo Movimiento</h3>
                <p className="text-emerald-100 text-sm">Registra una entrada o salida</p>
              </div>
              
              <form onSubmit={registrarMovimiento} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Producto *</label>
                  <select
                    value={productoSeleccionado}
                    onChange={(e) => setProductoSeleccionado(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                  >
                    <option value="">Selecciona un producto</option>
{productos.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.name} (Stock: {prod.currentStock})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo de Movimiento *</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTipoMovimiento('ENTRY')}
                      className={`py-4 rounded-xl font-semibold transition-all ${
                        tipoMovimiento === 'ENTRY'
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
>
                      <ArrowDownToLine className="w-8 h-8 mx-auto mb-2" />
                      ENTRADA
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoMovimiento('EXIT')}
                      className={`py-4 rounded-xl font-semibold transition-all ${
                        tipoMovimiento === 'EXIT'
                          ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <ArrowUpFromLine className="w-8 h-8 mx-auto mb-2" />
                      SALIDA
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Cantidad *</label>
                  <input
                    type="number"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    placeholder="0"
                    min="1"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Motivo</label>
                  <input
                    type="text"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
placeholder="Motivo del movimiento (opcional)"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setMostrarModal(false)}
                    className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
                  >
                    Registrar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
