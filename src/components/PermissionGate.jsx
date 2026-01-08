// components/PermissionGate.jsx
import { useAuth } from '../contexts/AuthContext';

/**
 * Componente para mostrar/ocultar elementos basado en permisos
 * 
 * @param {string|string[]} permission - Permiso(s) requerido(s)
 * @param {boolean} requireAll - Si es true, requiere todos los permisos (AND), si es false, cualquiera (OR)
 * @param {React.ReactNode} children - Contenido a mostrar si tiene permiso
 * @param {React.ReactNode} fallback - Contenido alternativo si no tiene permiso
 */
export const PermissionGate = ({ 
  permission, 
  requireAll = false, 
  children, 
  fallback = null 
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  const permisos = Array.isArray(permission) ? permission : [permission];
  
  let tienePermiso = false;
  
  if (permisos.length === 1) {
    tienePermiso = hasPermission(permisos[0]);
  } else if (requireAll) {
    tienePermiso = hasAllPermissions(permisos);
  } else {
    tienePermiso = hasAnyPermission(permisos);
  }

  return tienePermiso ? children : fallback;
};

/**
 * Componente para mostrar/ocultar elementos basado en rol
 * 
 * @param {string|string[]} role - Rol(es) requerido(s)
 * @param {React.ReactNode} children - Contenido a mostrar si tiene el rol
 * @param {React.ReactNode} fallback - Contenido alternativo si no tiene el rol
 */
export const RoleGate = ({ role, children, fallback = null }) => {
  const { hasRole } = useAuth();

  const roles = Array.isArray(role) ? role : [role];
  const tieneRol = roles.some(r => hasRole(r));

  return tieneRol ? children : fallback;
};

/**
 * Componente para mostrar/ocultar elementos basado en acceso a cartera
 * 
 * @param {number} carteraId - ID de la cartera
 * @param {React.ReactNode} children - Contenido a mostrar si tiene acceso
 * @param {React.ReactNode} fallback - Contenido alternativo si no tiene acceso
 */
export const CarteraGate = ({ carteraId, children, fallback = null }) => {
  const { hasCarteraAccess } = useAuth();

  return hasCarteraAccess(carteraId) ? children : fallback;
};

export default PermissionGate;
