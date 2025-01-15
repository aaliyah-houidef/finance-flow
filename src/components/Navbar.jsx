import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout, getCurrentUser } from '../services/auth';
import '../styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Détermine quel bouton afficher en fonction de la page courante
  const renderAuthButton = () => {
    const isLoginPage = location.pathname === '/login';
    const isRegisterPage = location.pathname === '/register';

    if (isLoginPage) {
      return (
        <Link to="/register" className="bg-green-500">
          Inscription
        </Link>
      );
    }

    if (isRegisterPage) {
      return (
        <Link to="/login" className="bg-indigo-500">
          Connexion
        </Link>
      );
    }

    // Sur les autres pages, afficher les deux boutons
    return (
      <>
        <Link to="/login" className="bg-indigo-500">
          Connexion
        </Link>
        <Link to="/register" className="bg-green-500">
          Inscription
        </Link>
      </>
    );
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
              {renderAuthButton()}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;