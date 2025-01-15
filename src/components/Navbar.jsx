import { Link, useNavigate, useLocation } from 'react-router-dom'; // Ajout de useLocation pour savoir quelle page est active
import { logout, getCurrentUser } from '../services/auth';
import '../styles/Navbar.css';

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
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <h1>FinanceFlow</h1>
        </div>
        
        <div className="navbar-right">
          {currentUser ? (
            <div className="flex">
              <span className="text-gray-300">
                Bienvenue, {currentUser.username}
              </span>

              {location.pathname === '/profile' ? (
                <Link to="/" className="bg-blue-500">
                  Accueil
                </Link>
              ) : (
                <Link to="/profile" className="bg-blue-500">
                  Profil
                </Link>
              )}

              <button onClick={handleLogout} className="bg-red-500">
                Déconnexion
              </button>
            </div>
          ) : (
            <div className="flex">
              <Link to="/login" className="bg-indigo-500">
                Connexion
              </Link>
              <Link to="/register" className="bg-green-500">
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
