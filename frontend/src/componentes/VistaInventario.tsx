import { useState } from 'react';
import { Trash2, Edit, Plus } from 'lucide-react';
import { useProductos } from '../ganchos/useProductos';
import { Producto } from '../tipos';

interface VistaInventarioProps {
  onSeleccionarProducto: (producto: Producto) => void;
}

export function VistaInventario({ onSeleccionarProducto }: VistaInventarioProps) {
  const { productos, cargando, error, crearProducto, actualizarProducto, eliminarProducto, recargarProductos } = useProductos();
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroStock, setFiltroStock] = useState<'todos' | 'critico' | 'bajo' | 'normal'>('todos');
  const [productoAEliminar, setProductoAEliminar] = useState<string | null>(null);

  const productosFiltrados = productos.filter(p => {
    const coincideBusqueda = p.name.toLowerCase().includes(busqueda.toLowerCase()) || 
                       p.sku.toLowerCase().includes(busqueda.toLowerCase());
    if (!coincideBusqueda) return false;
    
    const ratio = p.currentStock / p.minStock;
    if (filtroStock === 'critico') return ratio <= 1;
    if (filtroStock === 'bajo') return ratio > 1 && ratio <= 1.5;
    if (filtroStock === 'normal') return ratio > 1.5;
    return true;
  });

  const obtenerColorStock = (producto: Producto) => {
    const ratio = producto.currentStock / producto.minStock;
    if (ratio <= 1) return 'bg-red-100 text-red-700 border-red-200';
    if (ratio <= 1.5) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  const obtenerTextoStock = (producto: Producto) => {
    const ratio = producto.currentStock / producto.minStock;
    if (ratio <= 1) return 'CRÍTICO';
    if (ratio <= 1.5) return 'BAJO';
    return 'NORMAL';
  };

  const handleEliminar = async (id: string) => {
    const success = await eliminarProducto(id);
    if (success) {
      setProductoAEliminar(null);
    }
  };

return (
    <div className="flex-1 p-4 md:p-8 bg-slate-50 overflow-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:justify-between mb-6 md:mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Gestión de Inventario</h2>
            <p className="text-slate-500 mt-1">Administra tus productos y controla el stock</p>
          </div>
          <button
            onClick={() => setMostrarModalCrear(true)}
            className="flex items-center gap-2 w-full md:w-auto justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/25"
          >
            <Plus size={20} />
            <span className="md:hidden">Nuevo</span>
            <span className="hidden md:inline">Nuevo Producto</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre o SKU..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <select
              value={filtroStock}
              onChange={(e) => setFiltroStock(e.target.value as typeof filtroStock)}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="todos">Todos los estados</option>
              <option value="critico">Stock Crítico</option>
              <option value="bajo">Stock Bajo</option>
              <option value="normal">Stock Normal</option>
            </select>
          </div>
        </div>

        {cargando ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button onClick={recargarProductos} className="mt-4 text-blue-600 hover:underline">
              Reintentar
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productosFiltrados.map((producto) => (
              <div
                key={producto.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all group relative"
              >
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setProductoEditando(producto);
                    }}
                    className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setProductoAEliminar(producto.id);
                    }}
                    className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div 
                  onClick={() => onSeleccionarProducto(producto)}
                  className="cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 pr-12">
                      <h3 className="font-bold text-slate-800 text-lg">{producto.name}</h3>
                      <p className="text-slate-500 text-sm">SKU: {producto.sku}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${obtenerColorStock(producto)}`}>
                      {obtenerTextoStock(producto)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Stock Actual</span>
                      <span className="font-semibold text-slate-800">
                        {producto.currentStock} {producto.unit}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Stock Mínimo</span>
                      <span className="font-semibold text-slate-800">
                        {producto.minStock} {producto.unit}
                      </span>
                    </div>
                    
                    <div className="mt-3">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            producto.currentStock <= producto.minStock ? 'bg-red-500' :
                            producto.currentStock <= producto.minStock * 1.5 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ 
                            width: `${Math.min(100, (producto.currentStock / (producto.minStock * 2)) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {producto.category && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-400">Categoría: {producto.category}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!cargando && productosFiltrados.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-slate-700">No hay productos</h3>
            <p className="text-slate-500 mt-2">
              {busqueda || filtroStock !== 'todos' 
                ? 'No se encontraron productos con esos filtros' 
                : 'Comienza agregando tu primer producto'}
            </p>
            {!busqueda && filtroStock === 'todos' && (
              <button
                onClick={() => setMostrarModalCrear(true)}
                className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
              >
                Agregar Producto
              </button>
            )}
          </div>
        )}

        {mostrarModalCrear && (
          <ModalProducto 
            onCerrar={() => setMostrarModalCrear(false)}
            onGuardar={crearProducto}
            titulo="Nuevo Producto"
          />
        )}

        {productoEditando && (
          <ModalProducto 
            onCerrar={() => setProductoEditando(null)}
            onGuardar={(data) => actualizarProducto(productoEditando.id, data)}
            titulo="Editar Producto"
            productoPorDefecto={productoEditando}
          />
        )}

        {productoAEliminar && (
          <ModalConfirmacion
            titulo="Eliminar Producto"
            mensaje="¿Está seguro que desea eliminar este producto? Esta acción no se puede deshacer."
            textoBotonConfirmar="Eliminar"
            textoBotonCancelar="Cancelar"
            onConfirmar={() => handleEliminar(productoAEliminar)}
            onCancelar={() => setProductoAEliminar(null)}
            tipo="peligro"
          />
        )}
      </div>
    </div>
  );
}

interface ModalProductoProps {
  onCerrar: () => void;
  onGuardar: (data: Partial<Producto>) => Promise<Producto | null>;
  titulo: string;
  productoPorDefecto?: Producto;
}

function ModalProducto({ onCerrar, onGuardar, titulo, productoPorDefecto }: ModalProductoProps) {
  const [nombre, setNombre] = useState(productoPorDefecto?.name || '');
  const [sku, setSku] = useState(productoPorDefecto?.sku || '');
  const [stockMinimo, setStockMinimo] = useState(productoPorDefecto?.minStock.toString() || '');
  const [descripcion, setDescripcion] = useState(productoPorDefecto?.description || '');
  const [categoria, setCategoria] = useState(productoPorDefecto?.category || '');
  const [unidad, setUnidad] = useState(productoPorDefecto?.unit || 'unidades');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!nombre.trim() || !sku.trim()) {
      setError('El nombre y SKU son obligatorios');
      return;
    }
    
    const stockMin = parseInt(stockMinimo, 10);
    if (isNaN(stockMin) || stockMin < 0) {
      setError('Ingresa un número válido para stock mínimo');
      return;
    }
    
    setCargando(true);
    try {
      const resultado = await onGuardar({
        name: nombre,
        sku: sku,
        minStock: stockMin,
        description: descripcion || undefined,
        category: categoria || undefined,
        unit: unidad,
      });
      if (resultado) {
        onCerrar();
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white">{titulo}</h3>
          <p className="text-blue-100 text-sm">Completa los datos del producto</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre *</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del producto"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">SKU *</label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Código SKU"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              required
              disabled={!!productoPorDefecto}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Stock Mínimo *</label>
              <input
                type="number"
                value={stockMinimo}
                onChange={(e) => setStockMinimo(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Unidad</label>
              <input
                type="text"
                value={unidad}
                onChange={(e) => setUnidad(e.target.value)}
                placeholder="unidades"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Categoría</label>
            <input
              type="text"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              placeholder="Categoría (opcional)"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción (opcional)"
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
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
              onClick={onCerrar}
              className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {cargando ? 'Guardando...' : 'Guardar Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ModalConfirmacionProps {
  titulo: string;
  mensaje: string;
  textoBotonConfirmar: string;
  textoBotonCancelar: string;
  onConfirmar: () => void;
  onCancelar: () => void;
  tipo?: 'peligro' | 'advertencia' | 'info';
}

function ModalConfirmacion({
  titulo,
  mensaje,
  textoBotonConfirmar,
  textoBotonCancelar,
  onConfirmar,
  onCancelar,
  tipo = 'info'
}: ModalConfirmacionProps) {
  const colores = {
    peligro: { bg: 'from-red-600 to-red-700', btn: 'bg-red-600 hover:bg-red-700' },
    advertencia: { bg: 'from-amber-600 to-amber-700', btn: 'bg-amber-600 hover:bg-amber-700' },
    info: { bg: 'from-blue-600 to-blue-700', btn: 'bg-blue-600 hover:bg-blue-700' }
  };

  const color = colores[tipo];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className={`bg-gradient-to-r ${color.bg} px-6 py-4`}>
          <h3 className="text-xl font-bold text-white">{titulo}</h3>
        </div>
        
        <div className="p-6">
          <p className="text-slate-600 mb-6">{mensaje}</p>
          
          <div className="flex gap-3">
            <button
              onClick={onCancelar}
              className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
            >
              {textoBotonCancelar}
            </button>
            <button
              onClick={onConfirmar}
              className={`flex-1 px-4 py-3 ${color.btn} text-white font-semibold rounded-xl transition-colors`}
            >
              {textoBotonConfirmar}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
