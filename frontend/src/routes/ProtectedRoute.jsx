import { Navigate } from 'react-router-dom';
import { useAuthStore } from 'store/useAuthStore';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  return children;
}
