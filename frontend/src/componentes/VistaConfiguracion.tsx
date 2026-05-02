import { useState } from 'react';

export function VistaConfiguracion() {
  const [nombreEmpresa, setNombreEmpresa] = useState('Inventario Crítico');
  const [email, setEmail] = useState('admin@inventario.com');
  const [notificaciones, setNotificaciones] = useState(true);
  const [alertasEmail, setAlertasEmail] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const guardarConfiguracion = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje('');
    
    setTimeout(() => {
      setGuardando(false);
      setMensaje('Configuración guardada correctamente');
      setTimeout(() => setMensaje(''), 3000);
    }, 1000);
  };

return (
    <div className="flex-1 p-4 md:p-8 bg-slate-50 overflow-auto">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Configuración</h2>
          <p className="text-slate-500 mt-1">Personaliza el sistema a tu medida</p>
        </div>

        <form onSubmit={guardarConfiguracion} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Información General</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre de la Empresa</label>
                <input
                  type="text"
                  value={nombreEmpresa}
                  onChange={(e) => setNombreEmpresa(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email de Contacto</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Notificaciones</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer">
                <div>
                  <p className="font-semibold text-slate-700">Notificaciones Activas</p>
                  <p className="text-sm text-slate-500">Recibi alertas cuando el stock baje del mínimo</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotificaciones(!notificaciones)}
                  className={`w-12 h-7 rounded-full transition-colors ${
                    notificaciones ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                    notificaciones ? 'translate-x-6' : 'translate-x-1'
                  }`}></div>
                </button>
              </label>
              
              <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer">
                <div>
                  <p className="font-semibold text-slate-700">Alertas por Email</p>
                  <p className="text-sm text-slate-500">Recibi alertas en tu correo electrónico</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAlertasEmail(!alertasEmail)}
                  disabled={!notificaciones}
                  className={`w-12 h-7 rounded-full transition-colors ${
                    alertasEmail && notificaciones ? 'bg-blue-600' : 'bg-slate-300'
                  } ${!notificaciones ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                    alertasEmail && notificaciones ? 'translate-x-6' : 'translate-x-1'
                  }`}></div>
                </button>
              </label>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Umbrales de Alerta</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Stock Crítico</label>
                <div className="flex items-center gap-2">
                  <span className="text-red-500 text-xl">●</span>
                  <input
                    type="number"
                    defaultValue={100}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <span className="text-slate-500">%</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Porcentaje del stock mínimo</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Stock Bajo</label>
                <div className="flex items-center gap-2">
                  <span className="text-amber-500 text-xl">●</span>
                  <input
                    type="number"
                    defaultValue={150}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <span className="text-slate-500">%</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Porcentaje del stock mínimo</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Acerca de</h3>
            <div className="space-y-2 text-sm text-slate-600">
              <p><strong>Versión:</strong> 1.0.0</p>
<p><strong>Desarrollado por:</strong> Soler Beleño</p>
              <p><strong>Año:</strong> 2026</p>
            </div>
          </div>

          {mensaje && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-emerald-600 font-semibold">{mensaje}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={guardando}
            className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            {guardando ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </form>
      </div>
    </div>
  );
}
