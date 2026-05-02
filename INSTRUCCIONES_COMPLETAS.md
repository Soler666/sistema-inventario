# 🏥 Sistema de Rastreo de Inventario Crítico

Un sistema profesional de nivel producción para gestionar inventario de medicamentos o repuestos con arquitectura hexagonal, tiempo real con Socket.io y reportes en PDF.

## 📋 Características Principales

### ✅ Gestión de Productos
- Crear, leer, actualizar y eliminar productos
- Control de stock mínimo y alertas automáticas
- Categorización y seguimiento por SKU
- Edición inline con modales intuitivos

### ✅ Movimientos de Inventario
- Registrar entradas (ENTRY) y salidas (EXIT)
- Historial completo de movimientos
- Rastreo de productos por cada movimiento
- **En tiempo real con Socket.io**

### ✅ Sistema de Alertas
- Alertas automáticas cuando stock es crítico
- Categorización: CRÍTICO vs OUT_OF_STOCK
- Resolución manual de alertas
- **Notificaciones en tiempo real**

### ✅ Reportes y Estadísticas
- Dashboard con métricas clave
- Generación de PDF profesional
- Análisis por período (7 días, 30 días, total)
- Exportación de datos completos

## 🏗️ Arquitectura

```
Monorepo
├── backend/
│   ├── src/
│   │   ├── domain/          # Capa de Dominio
│   │   │   ├── entities/    # Entidades del negocio
│   │   │   └── ports/       # Interfaces/Contratos
│   │   ├── application/     # Casos de Uso
│   │   │   └── use-cases/
│   │   ├── infrastructure/  # Implementación
│   │   │   ├── controllers/
│   │   │   ├── repositories/
│   │   │   ├── database/
│   │   │   └── sockets/
│   │   └── config/          # Configuración
│   ├── prisma/              # Esquema ORM
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── componentes/     # Vistas principales
│   │   ├── components/      # Componentes reutilizables
│   │   ├── hooks/          # Hooks personalizados
│   │   ├── ganchos/        # Hooks (alias)
│   │   ├── utils/          # Utilidades
│   │   ├── types/          # Tipos TypeScript
│   │   └── index.tsx       # Punto de entrada
│   └── package.json
└── README.md
```

## 🔧 Requisitos

- Node.js 18+
- npm o yarn
- SQLite (incluido con Prisma)

## 📦 Instalación

### 1. Clonar/Abrir el proyecto

```bash
cd "c:\Users\SOLER DAVID\Videos\Monorepo"
```

### 2. Instalar Backend

```bash
cd backend
npm install
npm run db:push  # Crear/actualizar base de datos
```

### 3. Instalar Frontend

```bash
cd ../frontend
npm install
```

## 🚀 Ejecución

### Terminal 1: Backend

```bash
cd backend
npm run dev
# Server running on http://localhost:3001
```

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
# Vite dev server running on http://localhost:5173
```

### Acceder a la aplicación

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **API Health**: http://localhost:3001/api/health

## 📡 Endpoint API (Backend)

### Productos
```
GET    /api/products              # Listar todos
GET    /api/products/:id          # Obtener uno
POST   /api/products              # Crear
PUT    /api/products/:id          # Actualizar
DELETE /api/products/:id          # Eliminar
```

### Movimientos
```
GET    /api/movements             # Listar todos
POST   /api/movements             # Registrar
GET    /api/movements/:productId  # Por producto
```

### Alertas
```
GET    /api/alerts                # Listar activas
PUT    /api/alerts/:id/resolve    # Resolver
```

## 🔌 Socket.io Events

### Cliente → Servidor
```javascript
socket.emit('subscribe_alerts')    // Suscribirse a alertas
socket.emit('subscribe_movements') // Suscribirse a movimientos
socket.emit('subscribe_reports')   // Suscribirse a reportes
```

### Servidor → Cliente
```javascript
socket.on('new_alert', (alert) => {})      // Nueva alerta
socket.on('new_movement', (movement) => {})// Nuevo movimiento
socket.on('report_update', (data) => {})   // Actualización de reporte
```

## 🎯 Principios SOLID Implementados

### ✅ Single Responsibility Principle
- Cada clase tiene una única responsabilidad
- Controladores solo manejan HTTP
- Servicios contienen lógica de negocio
- Repositorios acceden a datos

### ✅ Open/Closed Principle
- Fácil agregar nuevos tipos de alertas
- Extensible sin modificar código existente

### ✅ Liskov Substitution Principle
- Interfaces de repositorio bien definidas
- Implementaciones intercambiables

### ✅ Interface Segregation Principle
- Interfaces pequeñas y específicas
- No fuerza implementar métodos innecesarios

### ✅ Dependency Injection Principle
- Inyección de dependencias en servicios
- Facilita testing y mantenimiento

## 🎨 UI/UX Design Minimalista

La interfaz sigue principios de Apple iOS/macOS:
- Espacios en blanco amplios
- Tipografía limpia sans-serif
- Bordes redondeados sutiles
- Paleta monocromática con acentos
- Glass morphism (blur backgrounds)
- Transiciones suaves

## 📊 Estructura de Datos

### Product
```typescript
{
  id: string;
  name: string;
  description?: string;
  sku: string;
  minStock: number;
  currentStock: number;
  unit: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Movement
```typescript
{
  id: string;
  productId: string;
  type: 'ENTRY' | 'EXIT';
  quantity: number;
  reason?: string;
  createdAt: Date;
}
```

### Alert
```typescript
{
  id: string;
  productId: string;
  type: 'CRITICAL_STOCK' | 'OUT_OF_STOCK';
  message: string;
  resolved: boolean;
  createdAt: Date;
  resolvedAt?: Date;
}
```

## 🐛 Arreglos Implementados

### Bug Resuelto: Productos no se mostraban en Movimientos

**Problema**: Cuando se intentaba crear un movimiento, no aparecían los productos en el selector.

**Causa**: 
- Endpoint `GET /api/movimientos` no existía
- Los movimientos no incluían información del producto relacionado

**Solución**:
- Agregado método `findAll()` al repositorio con JOIN a Product
- Nuevo endpoint que devuelve movimientos con datos del producto
- Socket.io para actualizaciones en tiempo real

## 🔄 Flujos Principales

### 1. Crear Producto
```
Frontend → POST /api/products → Backend
→ ProductService.createProduct()
→ ProductRepository.create()
→ Prisma
→ Guardado en DB
```

### 2. Registrar Movimiento
```
Frontend → POST /api/movements → Backend
→ MovementService.registerMovement()
→ Valida stock
→ Actualiza producto
→ Crea movimiento
→ Verifica alertas
→ Emite Socket.io
→ Frontend recibe en tiempo real
```

### 3. Generar Reporte PDF
```
Frontend → Recolecta datos
→ pdfGenerator.generateInventoryReport()
→ Crea documento profesional
→ Descarga archivo
```

## 📝 Logs de Cambios

### Backend
- ✅ Configuración HTTP + Socket.io
- ✅ Repositorio movimientos con JOIN
- ✅ Servicios emiten eventos Socket
- ✅ Nuevas rutas de API

### Frontend
- ✅ Hook useSocket con Socket.io-client
- ✅ Generador de PDF con jsPDF
- ✅ Modales de edición/eliminación
- ✅ Indicadores de conexión en tiempo real
- ✅ Actualización automática de vistas

## 🧪 Testing

Para verificar que todo funciona:

1. **Backend compilado**
   ```bash
   cd backend
   npm run build
   ```

2. **Frontend compilado**
   ```bash
   cd frontend
   npm run build
   ```

3. **Ejecutar aplicación**
   ```bash
   # Backend
   npm run dev
   
   # Frontend (otra terminal)
   npm run dev
   ```

4. **Pruebas manuales**
   - Crear un producto
   - Registrar un movimiento
   - Verificar alerta en tiempo real
   - Descargar reporte PDF
   - Editar/eliminar producto

## 📚 Dependencias Principales

### Backend
- `express` - Framework web
- `socket.io` - Comunicación en tiempo real
- `@prisma/client` - ORM
- `zod` - Validación

### Frontend
- `react` - UI
- `socket.io-client` - Cliente de Socket.io
- `jspdf` - Generación de PDF
- `tailwindcss` - Estilos
- `lucide-react` - Iconos

## 🔐 Consideraciones de Seguridad

- Validación de datos en frontend y backend
- Tipos TypeScript para prevenir errores
- CORS configurado correctamente
- Manejo de errores centralizado

## 🚀 Próximas Mejoras

- [ ] Autenticación y autorización
- [ ] Más gráficos y dashboards
- [ ] Exportación a Excel
- [ ] Sincronización offline
- [ ] Notificaciones push
- [ ] Múltiples usuarios y permisos

## 📄 Licencia

Proyecto educativo - MIT

---

**Desarrollado como Sistema de Rastreo de Inventario Crítico con Arquitectura Hexagonal**
