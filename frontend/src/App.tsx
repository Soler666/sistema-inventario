import { useState, useEffect } from 'react';
import { BarraNavegacion } from './componentes/BarraNavegacion';
import { VistaInventario } from './componentes/VistaInventario';
import { VistaMovimientos } from './componentes/VistaMovimientos';
import { VistaAlertas } from './componentes/VistaAlertas';
import { VistaReportes } from './componentes/VistaReportes';
import { VistaConfiguracion } from './componentes/VistaConfiguracion';
import { Producto } from './tipos';

export default function App() {
  const [vistaActual, setVistaActual] = useState('inventario');
  const [contadorAlertas, setContadorAlertas] = useState(0);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);

  useEffect(() => {
    const cargarAlertas = async () => {
      try {
        const res = await fetch('/api/alerts');
        const data = await res.json();
        if (data.success) {
          const activas = data.data.filter((a: any) => !a.resolved).length;
          setContadorAlertas(activas);
        }
      } catch (e) {
        console.error(e);
      }
    };

    cargarAlertas();
    const intervalo = setInterval(cargarAlertas, 30000);
    return () => clearInterval(intervalo);
  }, []);

  const renderizarVista = () => {
    switch (vistaActual) {
      case 'inventario':
        return <VistaInventario onSeleccionarProducto={setProductoSeleccionado} />;
      case 'movimientos':
        return <VistaMovimientos />;
      case 'alertas':
        return <VistaAlertas />;
      case 'reportes':
        return <VistaReportes />;
      case 'configuracion':
        return <VistaConfiguracion />;
      default:
        return <VistaInventario onSeleccionarProducto={setProductoSeleccionado} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <BarraNavegacion 
        vistaActual={vistaActual} 
        cambiarVista={setVistaActual} 
        contadorAlertas={contadorAlertas} 
      />
      {renderizarVista()}
    </div>
  );
}
