import { Link, useNavigate, useLocation } from 'react-router-dom'; // Ajout de useLocation pour savoir quelle page est active
import { logout, getCurrentUser } from '../services/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Permet de récupérer l'URL actuelle
  const currentUser = getCurrentUser();

  const handleLogout = () => {
    logout();
    // Redirection vers la page de connexion après la déconnexion
    navigate('/login');
    // Forcer le rechargement de la page pour réinitialiser l'état de l'application
    window.location.reload();
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <h1>FinanceFlow</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {currentUser ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-300">
                Bienvenue, {currentUser.username}
              </span>

              {/* Conditionner l'onglet en fonction de la page active */}
              {location.pathname === '/profile' ? (
                <Link
                  to="/"
                  className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded transition-colors"
                >
                  Accueil
                </Link>
              ) : (
                <Link
                  to="/profile"
                  className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded transition-colors"
                >
                  Profil
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition-colors"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link
                to="/login"
                className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded transition-colors"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded transition-colors"
              >
                Inscription
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
