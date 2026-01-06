# 🚀 Comandos Útiles - Frontend

## 📦 Instalación y Configuración

```powershell
# Instalar dependencias
npm install

# Instalación rápida con script (Windows)
.\install.ps1

# Crear archivo .env
echo "VITE_API_URL=http://localhost:3000" > .env
```

## 🛠️ Desarrollo

```powershell
# Iniciar servidor de desarrollo
npm run dev

# Iniciar en puerto específico
npm run dev -- --port 3000

# Abrir automáticamente en el navegador
npm run dev -- --open

# Ver en red local (para pruebas móviles)
npm run dev -- --host
```

## 🏗️ Build y Producción

```powershell
# Construir para producción
npm run build

# Vista previa de la build
npm run preview

# Construir y previsualizar
npm run build; npm run preview
```

## 🧹 Limpieza y Mantenimiento

```powershell
# Limpiar node_modules y reinstalar
Remove-Item -Recurse -Force node_modules
npm install

# Limpiar caché de npm
npm cache clean --force

# Actualizar dependencias
npm update

# Verificar dependencias desactualizadas
npm outdated

# Auditar vulnerabilidades
npm audit

# Corregir vulnerabilidades (cuidado con breaking changes)
npm audit fix
```

## 🔍 Linting y Formato

```powershell
# Ejecutar ESLint
npm run lint

# Corregir problemas automáticamente
npm run lint -- --fix
```

## 📊 Análisis de Bundle

```powershell
# Analizar tamaño del bundle
npm run build -- --report

# Ver estadísticas detalladas
npm run build -- --stats
```

## 🐛 Debugging

```powershell
# Modo verbose
npm run dev -- --debug

# Ver logs detallados
$env:DEBUG="*"; npm run dev
```

## 🔧 Configuración Avanzada

### Cambiar Puerto del Backend
```powershell
# Editar .env
echo "VITE_API_URL=http://localhost:4000" > .env
```

### Modo de Producción Local
```powershell
# Construir y servir
npm run build
npm run preview
```

### Limpiar Completamente
```powershell
# Eliminar node_modules, dist y caché
Remove-Item -Recurse -Force node_modules, dist
npm cache clean --force
npm install
```

## 📱 Pruebas en Dispositivos Móviles

```powershell
# Iniciar servidor accesible en red local
npm run dev -- --host

# Tu app estará disponible en:
# http://192.168.x.x:5173 (usa tu IP local)
```

## 🔐 Variables de Entorno

### Desarrollo (.env)
```env
VITE_API_URL=http://localhost:3000
```

### Producción (.env.production)
```env
VITE_API_URL=https://api.tudominio.com
```

## 📦 Gestión de Dependencias

```powershell
# Instalar una dependencia
npm install nombre-paquete

# Instalar como dependencia de desarrollo
npm install -D nombre-paquete

# Desinstalar una dependencia
npm uninstall nombre-paquete

# Listar dependencias instaladas
npm list --depth=0

# Ver información de un paquete
npm info nombre-paquete
```

## 🚀 Despliegue

### Vercel
```powershell
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel
```

### Netlify
```powershell
# Instalar Netlify CLI
npm i -g netlify-cli

# Desplegar
netlify deploy --prod
```

### Build para servidor tradicional
```powershell
# Construir
npm run build

# Los archivos estarán en la carpeta dist/
# Sube estos archivos a tu servidor web
```

## 🔄 Actualización de Dependencias

```powershell
# Actualizar React
npm install react@latest react-dom@latest

# Actualizar Material-UI
npm install @mui/material@latest @mui/icons-material@latest

# Actualizar todas las dependencias menores
npm update

# Actualizar dependencia específica
npm update nombre-paquete
```

## 📊 Monitoreo y Performance

```powershell
# Analizar tamaño del bundle
npm run build
# Luego usa herramientas como bundle-analyzer

# Lighthouse CI
npm install -g @lhci/cli
lhci autorun
```

## 🐳 Docker (Opcional)

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
```

```powershell
# Construir imagen
docker build -t cobros-frontend .

# Ejecutar contenedor
docker run -p 5173:5173 cobros-frontend
```

## 📝 Scripts Personalizados

Agregar al `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "clean": "rimraf node_modules dist",
    "reinstall": "npm run clean && npm install",
    "analyze": "vite build --mode analyze",
    "deploy:vercel": "vercel --prod",
    "deploy:netlify": "netlify deploy --prod"
  }
}
```

## 🔧 Troubleshooting

### Error: "Cannot find module"
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

### Error: "Port 5173 is already in use"
```powershell
# Cambiar puerto
npm run dev -- --port 3001
```

### Error: CORS
```powershell
# Asegúrate que el backend tenga CORS habilitado
# O usa un proxy en vite.config.js
```

### Cache issues
```powershell
# Limpiar caché del navegador
# O ejecutar:
npm run dev -- --force
```

## 📚 Referencias Rápidas

- **Vite Docs**: https://vitejs.dev
- **React Docs**: https://react.dev
- **Material-UI**: https://mui.com
- **React Router**: https://reactrouter.com
- **Formik**: https://formik.org
- **Axios**: https://axios-http.com

## 🎯 Atajos de Teclado en VSCode

- `Ctrl + P` - Buscar archivo
- `Ctrl + Shift + P` - Paleta de comandos
- `Ctrl + B` - Toggle sidebar
- `Ctrl + J` - Toggle terminal
- `Ctrl + K, Ctrl + S` - Atajos de teclado
- `Alt + Click` - Múltiples cursores

## 💡 Tips de Productividad

1. **Hot Reload**: Vite recarga automáticamente los cambios
2. **Extensiones VSCode**: ES7 React snippets, ESLint, Prettier
3. **DevTools**: Usa React DevTools para debugging
4. **Network Tab**: Monitorea las peticiones API en DevTools
5. **Console**: Usa console.log estratégicamente

---

¡Feliz desarrollo! 🎉
