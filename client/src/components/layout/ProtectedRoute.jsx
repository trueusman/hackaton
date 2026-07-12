import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FullPageSpinner } from '../Spinner';

// Frontend gate is purely UX (hide the route when clearly not logged in /
// wrong role) - every mutating action is still re-checked by the backend's
// protect()/authorize() middleware, which is the real enforcement point.
export function ProtectedRoute({ roles, children }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullPageSpinner />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
}
