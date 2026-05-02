import { useState, useEffect } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import { downloadReportPDF } from '../utils/pdfGenerator';

interface Producto {
  id: string;
  name: string;
  sku: string;
  minStock: number;
  currentStock: number;
  unit: string;
  category: string | null;
}

interface Movimiento {
  id: string;
  type: 'ENTRY' | 'EXIT';
  quantity: number;
  createdAt: string;
  product?: {
    name: string;
    sku: string;
  };
}

export function VistaReportes() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [periodo, setPeriodo] = useState<'7dias' | '30dias' | 'total'>('30dias');
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

  const productosCriticos = productos.filter(p => p.currentStock <= p.minStock);
  const productosBajos = productos.filter(p => {
    const ratio = p.currentStock / p.minStock;
    return ratio > 1 && ratio <= 1.5;
  });
  const productosSaludables = productos.filter(p => p.currentStock > p.minStock * 1.5);

  const movimientosFiltrados = movimientos.filter(m => {
    if (periodo === 'total') return true;
    const fecha = new Date(m.createdAt);
    const ahora = new Date();
    const dias = periodo === '7dias' ? 7 : 30;
    const diferencia = (ahora.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24);
    return diferencia <= dias;
  });

  const entradas = movimientosFiltrados.filter(m => m.type === 'ENTRY').length;
  const salidas = movimientosFiltrados.filter(m => m.type === 'EXIT').length;

  const getStockStatus = (producto: Producto) => {
    const ratio = producto.currentStock / producto.minStock;
    if (ratio <= 1) return 'critical';
    if (ratio <= 1.5) return 'warning';
    return 'healthy';
  };

  const handleDescargarPDF = () => {
    const titulo = `Reporte de Inventario - ${new Date().toLocaleDateString('es-ES')}`;
    downloadReportPDF(productos, movimientos, titulo + '.pdf');
  };

  if (cargando) {
    return (
      <div className="flex-1 p-8 bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-slate-50 overflow-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Reportes y Estadísticas</h2>
            <p className="text-slate-500 mt-1">Análisis completo de tu inventario</p>
            {isConnected && (
              <span className="inline-block mt-2 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-semibold">
                ● En tiempo real
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={cargarDatos}
              className="flex items-center gap-2 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition-all"
            >
              <RefreshCw size={18} />
              Actualizar
            </button>
            <button
              onClick={handleDescargarPDF}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/25"
            >
              <Download size={18} />
              Descargar PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/25 p-6 text-white">
            <p className="text-4xl font-bold">{productos.length}</p>
            <p className="text-blue-100">Total Productos</p>
          </div>
          
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg shadow-red-500/25 p-6 text-white">
            <p className="text-4xl font-bold">{productosCriticos.length}</p>
            <p className="text-red-100">Stock Crítico</p>
          </div>
          
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg shadow-amber-500/25 p-6 text-white">
            <p className="text-4xl font-bold">{productosBajos.length}</p>
            <p className="text-amber-100">Stock Bajo</p>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/25 p-6 text-white">
            <p className="text-4xl font-bold">{productosSaludables.length}</p>
            <p className="text-emerald-100">Stock Normal</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Movimientos</h3>
            <div className="flex gap-4 mb-4">
              {(['7dias', '30dias', 'total'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriodo(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    periodo === p ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {p === '7dias' ? '7 días' : p === '30dias' ? '30 días' : 'Total'}
                </button>
              ))}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📥</span>
                  <span className="font-semibold text-slate-700">Entradas</span>
                </div>
                <span className="text-2xl font-bold text-emerald-600">{entradas}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📤</span>
                  <span className="font-semibold text-slate-700">Salidas</span>
                </div>
                <span className="text-2xl font-bold text-red-600">{salidas}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Estado General</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Salud del inventario</span>
                  <span className="font-semibold">
                    {productosCriticos.length > 0 
                      ? `${Math.round((1 - productosCriticos.length / productos.length) * 100)}%` 
                      : '100%'}
                  </span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      productosCriticos.length > productos.length * 0.3 
                        ? 'bg-red-500' 
                        : productosCriticos.length > 0 
                          ? 'bg-amber-500' 
                          : 'bg-emerald-500'
                    }`}
                    style={{ 
                      width: productosCriticos.length > 0 
                        ? `${Math.max(0, 100 - (productosCriticos.length / productos.length) * 100)}%` 
                        : '100%' 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
            <h3 className="text-lg font-bold text-slate-800">Inventario por Estado</h3>
          </div>
          
          <div className="divide-y divide-slate-100 max-h-96 overflow-auto">
            {productos.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-slate-500">No hay productos registrados</p>
              </div>
            ) : (
              productos.map((producto) => (
                <div key={producto.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{producto.name}</p>
                    <p className="text-sm text-slate-500">SKU: {producto.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-800">
                      {producto.currentStock} / {producto.minStock} {producto.unit}
                    </p>
                    <span className={`text-xs font-bold inline-block mt-1 px-2 py-1 rounded-full ${
                      getStockStatus(producto) === 'critical' 
                        ? 'bg-red-100 text-red-700' 
                        : getStockStatus(producto) === 'warning' 
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {getStockStatus(producto) === 'critical' 
                        ? 'CRÍTICO' 
                        : getStockStatus(producto) === 'warning' 
                          ? 'BAJO' 
                          : 'NORMAL'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
