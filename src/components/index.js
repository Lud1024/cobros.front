// Componentes reutilizables del sistema
// Este archivo centraliza todas las exportaciones de componentes

// Layout y navegación
export { default as Layout } from './Layout';
export { default as PrivateRoute } from './PrivateRoute';

// Componentes de UI responsive
export { default as ResponsiveButton } from './ResponsiveButton';
export { default as ResponsiveTable } from './ResponsiveTable';
export { default as SearchInput } from './SearchInput';

// Diálogos y modales
export { default as ConfirmDialog } from './ConfirmDialog';

// Estados y feedback
export { default as PageHeader } from './PageHeader';
export { EmptyState, LoadingState, ErrorState } from './EmptyState';
export { StatusAlert, Toast, InlineMessage, ConnectionStatus, FormErrors } from './Alerts';

// Estadísticas y métricas
export { StatCard, StatCardGrid, MiniStat, ProgressStat } from './Stats';
// Control de acceso basado en roles y permisos
export { PermissionGate, RoleGate, CarteraGate } from './PermissionGate';