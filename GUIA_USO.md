# Guía de Uso del Sistema de Gestión de Préstamos y Cobros

## 🎯 Inicio Rápido

### 1. Instalación y Configuración

```bash
# Navegar a la carpeta frontend
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
# Crear archivo .env con:
# VITE_API_URL=http://localhost:3000

# Iniciar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### 2. Primer Uso

#### Registro de Usuario
1. Navega a `http://localhost:5173/register`
2. Completa el formulario con:
   - Nombre y Apellido
   - Usuario (mínimo 3 caracteres, solo letras, números y guión bajo)
   - Correo electrónico válido
   - Teléfono (opcional)
   - Contraseña segura (mínimo 8 caracteres con mayúsculas, minúsculas, números y símbolos)
3. Click en "Registrarse"
4. Revisa tu correo para confirmar la cuenta
5. Inicia sesión

#### Inicio de Sesión
1. Navega a `http://localhost:5173/login`
2. Ingresa tu usuario y contraseña
3. Click en "Iniciar Sesión"
4. Serás redirigido al Dashboard

## 📋 Flujo de Trabajo Recomendado

### Paso 1: Gestión de Clientes
1. Ve a **Clientes** en el menú lateral
2. Click en "Nuevo Cliente"
3. Completa la información:
   - Tipo y número de identificación
   - Datos personales (nombre, apellido, fecha de nacimiento)
   - Información de contacto (teléfono, correo, dirección)
   - Ubicación (ciudad, país)
4. Click en "Crear"

**Validaciones importantes:**
- El DNI debe tener 8 dígitos
- El RUC debe tener 11 dígitos
- El teléfono debe ser válido
- El correo debe tener formato válido

### Paso 2: Configuración de Periodicidades
1. Ve a **Configuración** en el menú lateral
2. Configura las periodicidades disponibles (Mensual, Quincenal, Semanal, etc.)
3. Estas se usarán al crear préstamos

### Paso 3: Creación de Préstamos
1. Ve a **Préstamos** en el menú lateral
2. Click en "Nuevo Préstamo"
3. Completa la información:
   - Selecciona el cliente (usa el buscador)
   - Monto del préstamo
   - Tasa de interés anual (%)
   - Plazo en meses
   - Fecha de desembolso
   - Periodicidad de pago
   - Observaciones (opcional)
4. Click en "Crear"

**Cálculos automáticos:**
- El sistema calculará automáticamente las cuotas
- Se generará el calendario de pagos
- Se asignará un número de préstamo único

### Paso 4: Registro de Pagos
1. Ve a **Pagos** en el menú lateral
2. Click en "Registrar Pago"
3. Completa la información:
   - Selecciona el préstamo
   - Fecha de pago
   - Monto pagado
   - Método de pago (Efectivo, Transferencia, etc.)
   - Número de recibo
   - Observaciones (opcional)
4. Click en "Registrar"

**El sistema automáticamente:**
- Aplica el pago a las cuotas pendientes
- Actualiza el estado de las cuotas
- Registra el historial de pagos

### Paso 5: Seguimiento de Cuotas
1. Ve a **Cuotas** en el menú lateral
2. Visualiza todas las cuotas del sistema
3. Filtra por préstamo específico si lo necesitas
4. Observa el progreso de pago de cada cuota
5. Identifica cuotas vencidas o pendientes

**Estados de cuotas:**
- 🟡 **Pendiente**: Cuota sin pagar
- 🟢 **Pagada**: Cuota completamente pagada
- 🔴 **Vencida**: Cuota con fecha de vencimiento pasada
- 🔵 **Parcial**: Cuota con pago parcial

## 📊 Dashboard y Reportes

### Dashboard Principal
El dashboard muestra:
- Total de clientes registrados
- Total de préstamos activos
- Monto total prestado
- Total de pagos recibidos
- Gráficos de préstamos por estado
- Distribución de cartera

### Exportación de Reportes

#### Exportar a PDF
1. Ve al Dashboard o a cualquier módulo con opción de reporte
2. Click en "Exportar PDF"
3. El sistema genera un documento PDF con:
   - Encabezado profesional
   - Estadísticas resumidas
   - Tablas formateadas
   - Fecha y hora de generación

#### Exportar a Excel
1. Click en "Exportar Excel"
2. El sistema genera un archivo Excel con:
   - Múltiples hojas de cálculo
   - Datos tabulados
   - Formato profesional
   - Fácil de editar y analizar

## 🔍 Búsqueda y Filtrado

### Barra de Búsqueda
- Todos los módulos incluyen búsqueda en tiempo real
- Busca por nombre, número de identificación, ID, etc.
- Los resultados se filtran automáticamente

### Filtros Avanzados
- En Cuotas: Filtra por préstamo específico
- En Préstamos: Filtra por estado, cliente, rango de fechas
- En Pagos: Filtra por método de pago, rango de fechas

## ⚙️ Configuración del Sistema

### Perfil de Usuario
1. Click en tu avatar en la esquina superior derecha
2. Selecciona "Mi Perfil"
3. Visualiza tu información de usuario
4. (Próximamente: edición de perfil)

### Configuración General
1. Ve a **Configuración** en el menú lateral
2. Configura:
   - Periodicidades de pago
   - Métodos de pago aceptados
   - Políticas de mora
   - Roles y permisos
   - Carteras de crédito

## 🚨 Manejo de Errores

### Errores Comunes

#### "Token inválido o expirado"
- **Causa**: La sesión ha expirado
- **Solución**: Vuelve a iniciar sesión

#### "Error de validación"
- **Causa**: Datos ingresados no cumplen con las validaciones
- **Solución**: Revisa los campos marcados en rojo y corrige

#### "Error al conectar con el servidor"
- **Causa**: El backend no está ejecutándose
- **Solución**: Asegúrate que el backend esté corriendo en `http://localhost:3000`

### Notificaciones
- 🟢 **Verde**: Operación exitosa
- 🔴 **Rojo**: Error en la operación
- 🟡 **Amarillo**: Advertencia
- 🔵 **Azul**: Información

## 📱 Uso Móvil

El sistema es completamente responsive:
- ✅ Funciona en smartphones y tablets
- ✅ Menú adaptable para pantallas pequeñas
- ✅ Tablas con scroll horizontal
- ✅ Formularios optimizados para touch

## 🔐 Seguridad

### Mejores Prácticas
1. **Contraseñas seguras**: Usa mayúsculas, minúsculas, números y símbolos
2. **Cierra sesión**: Al terminar, siempre cierra sesión
3. **No compartas credenciales**: Cada usuario debe tener su propia cuenta
4. **Revisa actividad**: Monitorea los registros de acceso

### Políticas de Contraseña
- Mínimo 8 caracteres
- Al menos 1 mayúscula
- Al menos 1 minúscula
- Al menos 1 número
- Al menos 1 carácter especial

## 📈 Tips de Productividad

1. **Usa atajos de teclado**:
   - `Tab`: Navegar entre campos del formulario
   - `Enter`: Enviar formulario
   - `Esc`: Cerrar diálogos

2. **Aprovecha la búsqueda**:
   - Busca clientes rápidamente antes de crear préstamos
   - Filtra cuotas para seguimiento específico

3. **Exporta reportes regularmente**:
   - Genera respaldos semanales en Excel
   - Imprime reportes PDF para documentación

4. **Organiza tu flujo**:
   - Registra clientes primero
   - Luego crea préstamos
   - Registra pagos conforme se reciben
   - Revisa cuotas vencidas diariamente

## 🆘 Soporte

Si necesitas ayuda:
1. Revisa esta documentación
2. Consulta el README.md del proyecto
3. Revisa los mensajes de error y validación
4. Contacta al administrador del sistema

## 🎓 Capacitación

### Para Nuevos Usuarios
1. Lee esta guía completa
2. Practica con datos de prueba
3. Crea clientes y préstamos de ejemplo
4. Familiarízate con cada módulo
5. Exporta reportes de prueba

### Para Administradores
1. Configura periodicidades y métodos de pago
2. Define políticas de mora
3. Asigna roles y permisos
4. Capacita a los usuarios finales
5. Establece procesos de respaldo

## 📅 Mantenimiento

### Respaldos
- Exporta reportes Excel semanalmente
- Mantén copias de seguridad de la base de datos
- Documenta cambios en configuración

### Actualizaciones
- Revisa el repositorio para nuevas versiones
- Lee las notas de lanzamiento
- Prueba en entorno de desarrollo primero
- Actualiza en horarios de bajo tráfico

---

¡Feliz gestión de préstamos! 🎉