# 📦 Sistema de Rastreo de Inventario Crítico

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.10-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> Sistema de seguimiento de inventario de nivel producción con arquitectura hexagonal, alertas automáticas en tiempo real y UI minimalista inspirada en Apple.

## 🎯 Características

- ✅ **Gestión de Productos** - CRUD completo con SKU y categorías
- ✅ **Movimientos de Inventario** - Entradas/Salidas con motivo
- ✅ **Alertas Automáticas** - Detección de stock crítico y agotado
- ✅ **Dashboard en Tiempo Real** - Conteo de alertas activas via WebSocket
- ✅ **Arquitectura Hexagonal** - Código mantenible y escalable
- ✅ **Interfaz Apple-inspired** - Diseño minimalista moderno

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────┐
│            Capa de Infraestructura            │
│  (Controladores, Repositorios, BD)         │
├─────────────────────────────────────────────┤
│            Capa de Aplicación               │
│           (Casos de Uso)                   │
├─────────────────────────────────────────────┤
│              Capa de Dominio               │
│       (Entidades, Reglas de Negocio)        │
├─────────────────────────────────────────────┤
│               Capa de Puertos              │
│    (Interfaces / Clases Abstractas)        │
└─────────────────────────────────────────────┘
```

## 🛠️ Stack Tecnológico

### Backend

| Tecnología | Propósito |
|-------------|-----------|
| Node.js 18+ | Runtime JavaScript |
| Express | Framework web |
| TypeScript 5.3 | Lenguaje tipado |
| Prisma 5.10 | ORM (SQLite/PostgreSQL) |
| Socket.IO | WebSockets en tiempo real |
| Zod | Validación de datos |

### Frontend

| Tecnología | Propósito |
|-------------|-----------|
| React 18 | Framework UI |
| TypeScript 5.3 | Lenguaje tipado |
| Tailwind CSS 3.4 | Estilos utility-first |
| Lucide React | Iconos |
| jsPDF | Generación PDFs |
| Socket.IO Client | WebSockets |

## 📁 Estructura del Proyecto

```
Monorepo/
├── backend/               # API REST + WebSocket
│   ├── prisma/            # Schema de base de datos
│   └── src/
│       ├── domain/       # Entidades y puertos
│       │   ├── entities/
│       │   └── ports/
│       ├── application/ # Casos de uso
│       ├── infrastructure # Implementaciones
│       │   ├── repositories/
│       │   ���── controllers/
│       │   └── sockets/
│       └── config/       # Configuración
│
└── frontend/             # Interfaz React
    └── src/
        ├── components/  # Componentes UI
        ├── hooks/       # Custom hooks
        ├── tipos/      # Tipos TypeScript
        └── utils/      # Utilidades
```

## 🚀 Instalación

### Requisitos Previos

- Node.js 18 o superior
- npm o yarn

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/Soler666/sistema-inventario.git
cd Monorepo

# 2. Instalar dependencias del backend
cd backend
npm install

# 3. Generar cliente Prisma
npm run db:generate

# 4. Aplicar schema a la base de datos
npm run db:push

# 5. Regresar y instalar frontend
cd ../frontend
npm install
```

## 💻 Uso en Desarrollo

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:5173

## 📦 Scripts Disponibles

### Backend

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Iniciar en modo desarrollo |
| `npm run build` | Compilar TypeScript |
| `npm run start` | Iniciar producción |
| `npm run db:push` | Sincronizar schema |
| `npm run db:generate` | Generar cliente Prisma |
| `npm run db:studio` | Abrir Prisma Studio |

### Frontend

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Iniciar servidor dev |
| `npm run build` | Compilar producción |
| `npm run preview` | Previsualizar build |

## 🔌 Endpoints de API

### Productos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/products` | Listar todos |
| GET | `/api/products/:id` | Obtener por ID |
| POST | `/api/products` | Crear producto |
| PUT | `/api/products/:id` | Actualizar producto |
| DELETE | `/api/products/:id` | Eliminar producto |

### Movimientos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/movements` | Registrar movimiento |
| GET | `/api/products/:id/movements` | Ver movimientos |

### Alertas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/alerts` | Listar alertas |
| GET | `/api/alerts/dashboard` | Dashboard |
| PUT | `/api/alerts/:id/resolve` | Resolver alerta |

## 📄 Entidades

### Producto
```typescript
{
  id: string;
  name: string;
  description: string | null;
  sku: string;
  minStock: number;
  currentStock: number;
  unit: string;
  category: string | null;
}
```

### Movimiento
```typescript
{
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    sku: string;
  };
  type: 'ENTRY' | 'EXIT';
  quantity: number;
  reason: string | null;
}
```

### Alerta
```typescript
{
  id: string;
  productId: string;
  type: 'CRITICAL_STOCK' | 'OUT_OF_STOCK';
  message: string;
  resolved: boolean;
}
```

## 🎨 Sistema de Diseño

### Colores

| Propósito | Color | Hex |
|-----------|-------|-----|
| Primario | Gris oscuro | #1d1d1f |
| Secundario | Gris medio | #86868b |
| Acento | Azul Apple | #0071e3 |
| Crítico | Rojo | #ff3b30 |
| Advertencia | Naranja | #ff9500 |
| Éxito | Verde | #34c759 |

### Componentes

- Efecto glass con backdrop-blur
- Bordes redondeados 12-16px
- Sombras sutiles
- Tipografía system-ui

## 🔒 Seguridad

- ✅ Validación con Zod
- ✅ TypeScript strict mode
- ✅ SQL injection prevention (Prisma)
- ✅ Manejo de errores Profesional

## 📈 Escalabilidad

La arquitectura hexagonal permite:

- Migrar de SQLite a PostgreSQL facilmente
- Intercambiar proveedores de notificación
- Agregar caché sin modificar dominio
- Testear lógica en aislamiento

## 📝 Licencia

SOLER BELEÑO

---

⭐️ Si te gusta este proyecto, ¡dale una estrella!
