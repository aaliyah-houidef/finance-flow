import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../services/auth';

const ProtectedRoute = ({ children }) => {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;