# Sistema de Gestión de Préstamos y Cobros - Frontend

Sistema completo de gestión de préstamos, cobros y carteras con interfaz moderna construida con React, Vite y Material-UI.

## 🚀 Características

### Funcionalidades Principales

- **Autenticación y Autorización**
  - Sistema de login y registro con validaciones
  - Protección de rutas con JWT
  - Gestión de sesiones y tokens automática
  - Recuperación de contraseña y confirmación por email

- **Gestión de Clientes**
  - CRUD completo con validaciones
  - Búsqueda y filtrado avanzado
  - Múltiples tipos de identificación
  - Información de contacto y ubicación

- **Gestión de Préstamos**
  - Creación de préstamos con cálculo de cuotas
  - Configuración de tasas de interés y plazos
  - Seguimiento de estados (Pendiente, Aprobado, Rechazado, etc.)
  - Periodicidades configurables

- **Gestión de Pagos**
  - Registro de pagos con múltiples métodos
  - Comprobantes y números de recibo
  - Aplicación automática a cuotas
  - Historial completo de transacciones

- **Gestión de Cuotas**
  - Visualización de calendario de pagos
  - Estado de cada cuota (Pendiente, Pagada, Vencida)
  - Seguimiento de pagos parciales
  - Progreso visual de pago

- **Dashboard y Reportes**
  - Estadísticas en tiempo real
  - Gráficos interactivos (barras, pastel)
  - Exportación a PDF y Excel
  - Análisis de cartera y morosidad

### Características Técnicas

- **Material-UI (MUI)** - Diseño inspirado en Google Material Design
- **React Router** - Navegación con rutas protegidas
- **Formik + Yup** - Validación de formularios robusta
- **Axios** - Cliente HTTP con interceptores para JWT
- **Recharts** - Gráficos y visualizaciones
- **jsPDF + xlsx** - Exportación de reportes
- **Notistack** - Notificaciones elegantes

## 📋 Requisitos Previos

- Node.js 18+ y npm/yarn
- Backend del sistema de cobros ejecutándose en `http://localhost:3000`

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   cd frontend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Crear archivo `.env` en la raíz del proyecto:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

4. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/         # Componentes reutilizables
│   │   ├── Layout.jsx     # Layout principal con navegación
│   │   └── PrivateRoute.jsx  # Protección de rutas
│   ├── contexts/          # Contextos de React
│   │   └── AuthContext.jsx   # Contexto de autenticación
│   ├── pages/             # Páginas de la aplicación
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Clientes.jsx
│   │   ├── Prestamos.jsx
│   │   ├── Pagos.jsx
│   │   ├── Cuotas.jsx
│   │   ├── VisitasCobro.jsx
│   │   ├── Reportes.jsx
│   │   ├── Configuracion.jsx
│   │   └── Perfil.jsx
│   ├── services/          # Servicios y API
│   │   └── api.js        # Configuración de Axios y servicios
│   ├── theme.js          # Tema de Material-UI (estilo Google)
│   ├── App.jsx           # Componente principal con rutas
│   └── main.jsx          # Punto de entrada
├── .env                  # Variables de entorno
├── package.json
├── vite.config.js
└── README.md
```

## 🎨 Tema y Diseño

El diseño está inspirado en **Google Material Design** con:

- Paleta de colores de Google (Blue, Green, Red, Yellow)
- Tipografía Roboto
- Sombras y elevaciones sutiles
- Animaciones fluidas
- Diseño responsivo para móviles y tablets

## 🔐 Autenticación

El sistema utiliza JWT (JSON Web Tokens) para la autenticación:

1. El usuario inicia sesión con usuario y contraseña
2. El servidor devuelve un token JWT
3. El token se almacena en `localStorage`
4. Todas las peticiones subsecuentes incluyen el token en el header `Authorization: Bearer <token>`
5. Los interceptores de Axios manejan automáticamente la renovación y errores

## 📊 Exportación de Reportes

### PDF
- Generación con jsPDF y jspdf-autotable
- Formato profesional con logo y encabezados
- Tablas con formato automático

### Excel
- Exportación con xlsx
- Múltiples hojas de cálculo
- Formato y estilos personalizados

## 🚦 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Producción
npm run build        # Construye para producción
npm run preview      # Vista previa de la build

# Linting
npm run lint         # Ejecuta ESLint
```

## 🔧 Configuración Adicional

### Proxy para desarrollo
Si el backend está en un puerto diferente, configura el proxy en `vite.config.js`:

```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
```

## 📝 Validaciones

Todas las validaciones están implementadas con **Yup**:

- Campos requeridos
- Formatos de email y teléfono
- Rangos numéricos
- Contraseñas seguras (mayúsculas, minúsculas, números, símbolos)
- Longitudes mínimas y máximas

## 🎯 Próximas Características

- [ ] Módulo de visitas de cobro completo
- [ ] Reportes de morosidad avanzados
- [ ] Notificaciones en tiempo real
- [ ] Chat de soporte interno
- [ ] Firma digital de documentos
- [ ] Integración con pasarelas de pago
- [ ] App móvil con React Native

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👥 Autor

Sistema desarrollado para gestión de préstamos y cobros.

## 🐛 Reporte de Bugs

Si encuentras algún bug, por favor abre un issue en el repositorio con:
- Descripción del problema
- Pasos para reproducir
- Comportamiento esperado
- Screenshots si aplica

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
