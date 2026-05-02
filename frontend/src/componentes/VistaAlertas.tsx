import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, BarChart3, Package, XCircle, RefreshCw } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';

interface Alerta {
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

export function VistaAlertas() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState<'todas' | 'activas' | 'resueltas'>('todas');
  const { isConnected, onNewAlert } = useSocket();

  useEffect(() => {
    cargarAlertas();
  }, []);

  useEffect(() => {
    const unsubscribe = onNewAlert((alert) => {
      setAlertas(prev => {
        const existe = prev.find(a => a.id === alert.id);
        if (existe) {
          return prev.map(a => a.id === alert.id ? alert : a);
        }
        return [alert, ...prev];
      });
    });
    return unsubscribe;
  }, [onNewAlert]);

  const cargarAlertas = async () => {
    setCargando(true);
    try {
      const res = await fetch('/api/alerts');
      const data = await res.json();
      if (data.success) setAlertas(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  };

  const resolverAlerta = async (id: string) => {
    try {
      const res = await fetch(`/api/alerts/${id}/resolve`, {
        method: 'PUT',
      });
      const data = await res.json();
      if (data.success) {
        setAlertas(prev => prev.map(a => 
          a.id === id ? { ...a, resolved: true, resolvedAt: new Date().toISOString() } : a
        ));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const alertasFiltradas = alertas.filter(a => {
    if (filtro === 'activas') return !a.resolved;
    if (filtro === 'resueltas') return a.resolved;
    return true;
  });

  const conteo = {
    total: alertas.length,
    activas: alertas.filter(a => !a.resolved).length,
    resueltas: alertas.filter(a => a.resolved).length,
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
    <div className="flex-1 p-8 bg-slate-50 overflow-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Centro de Alertas</h2>
            <p className="text-slate-500 mt-1">Monitorea el estado de tu inventario</p>
            {isConnected && (
              <span className="inline-block mt-2 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-semibold">
                ● En tiempo real
              </span>
            )}
          </div>
          <button
            onClick={cargarAlertas}
            className="flex items-center gap-2 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition-all"
          >
            <RefreshCw size={18} />
            Actualizar
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-4">
<div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-800">{conteo.total}</p>
                <p className="text-sm text-slate-500">Total</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-4">
<div className="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-red-600">{conteo.activas}</p>
                <p className="text-sm text-slate-500">Activas</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-4">
<div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-emerald-600">{conteo.resueltas}</p>
                <p className="text-sm text-slate-500">Resueltas</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex gap-2">
            {(['todas', 'activas', 'resueltas'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filtro === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f === 'todas' ? 'Todas' : f === 'activas' ? 'Activas' : 'Resueltas'}
              </button>
            ))}
          </div>
        </div>

        {cargando ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : alertasFiltradas.length === 0 ? (
<div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-200">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
            <h3 className="text-xl font-semibold text-slate-700">
              {filtro === 'todas' ? '¡Todo despejado!' : 'No hay alertas'}
            </h3>
            <p className="text-slate-500 mt-2">
              {filtro === 'todas' 
                ? 'No tienes alertas pendiente' 
                : `No hay alertas ${filtro === 'activas' ? 'activas' : 'resueltas'}`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {alertasFiltradas.map((alerta) => (
              <div
                key={alerta.id}
                className={`bg-white rounded-2xl shadow-sm border-2 p-5 transition-all ${
                  alerta.resolved 
                    ? 'border-emerald-200 opacity-75' 
                    : 'border-red-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
<div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      alerta.resolved ? 'bg-emerald-100' : 'bg-red-100'
                    }`}>
                      {alerta.resolved ? (
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                      ) : (
                        alerta.type === 'OUT_OF_STOCK' ? (
                          <XCircle className="w-6 h-6 text-red-600" />
                        ) : (
                          <AlertTriangle className="w-6 h-6 text-red-600" />
                        )
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-800">
                          {alerta.producto?.name || 'Producto'}
                        </h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          alerta.resolved 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {alerta.resolved ? 'RESUELTA' : alerta.type === 'OUT_OF_STOCK' ? 'AGOTADO' : 'CRÍTICO'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{alerta.message}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        {formatearFecha(alerta.createdAt)}
                        {alerta.resolved && alerta.resolvedAt && (
                          <> • Resuelta: {formatearFecha(alerta.resolvedAt)}</>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {!alerta.resolved && (
                    <button
                      onClick={() => resolverAlerta(alerta.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      Resolver
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
