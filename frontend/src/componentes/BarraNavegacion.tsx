import { useState } from 'react';
import { Package, ArrowRightLeft, AlertTriangle, BarChart3, Settings, Menu, X } from 'lucide-react';

interface BarraNavegacionProps {
  vistaActual: string;
  cambiarVista: (vista: string) => void;
  contadorAlertas: number;
}

const menuItems = [
  { id: 'inventario', icono: Package, titulo: 'Inventario' },
  { id: 'movimientos', icono: ArrowRightLeft, titulo: 'Movimientos' },
  { id: 'alertas', icono: AlertTriangle, titulo: 'Alertas', mostrarAlerta: true },
  { id: 'reportes', icono: BarChart3, titulo: 'Reportes' },
  { id: 'configuracion', icono: Settings, titulo: 'Configuración' },
];

export function BarraNavegacion({ vistaActual, cambiarVista, contadorAlertas }: BarraNavegacionProps) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <>
      {/* Botón hamburger para móvil */}
      <button
        onClick={() => setMenuAbierto(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 text-white rounded-lg"
      >
        <Menu size={24} />
      </button>

      {/* Navegación en móvil (sidebar desplazable) */}
      <div className={`fixed inset-0 z-40 md:hidden ${menuAbierto ? 'block' : 'hidden'}`}>
        <div className="absolute inset-0 bg-black/50" onClick={cerrarMenu}></div>
        <nav className="absolute left-0 top-0 w-64 min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4 flex flex-col">
          <div className="flex justify-between items-center mb-8 pt-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Inventario Crítico</h1>
              <p className="text-slate-400 text-sm mt-1">Sistema de Gestión</p>
            </div>
            <button onClick={cerrarMenu} className="p-2">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  cambiarVista(item.id);
                  cerrarMenu();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  vistaActual === item.id
                    ? 'bg-blue-600 shadow-lg shadow-blue-600/30'
                    : 'hover:bg-slate-700/50'
                }`}
              >
                <item.icono className="text-xl" />
                <span className="font-medium">{item.titulo}</span>
                {item.mostrarAlerta && contadorAlertas > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {contadorAlertas}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-700">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold">
                AD
              </div>
              <div>
                <p className="font-medium text-sm">Administrador</p>
                <p className="text-slate-400 text-xs">Admin del sistema</p>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Navegación en desktop */}
      <nav className="hidden md:flex w-64 min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4 flex-col">
        <div className="mb-8 pt-4">
          <h1 className="text-2xl font-bold tracking-tight">Inventario Crítico</h1>
          <p className="text-slate-400 text-sm mt-1">Sistema de Gestión</p>
        </div>

        <div className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => cambiarVista(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                vistaActual === item.id
                  ? 'bg-blue-600 shadow-lg shadow-blue-600/30'
                  : 'hover:bg-slate-700/50'
              }`}
            >
              <item.icono className="text-xl" />
              <span className="font-medium">{item.titulo}</span>
              {item.mostrarAlerta && contadorAlertas > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {contadorAlertas}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-700">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold">
              AD
            </div>
            <div>
              <p className="font-medium text-sm">Administrador</p>
              <p className="text-slate-400 text-xs">Admin del sistema</p>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
