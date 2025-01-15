import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import Navbar from './components/Navbar';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './components/Home';
import Profile from './components/Profile';

import { getCurrentUser } from './services/auth';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleRegisterSuccess = (userData) => {
    setUser(userData);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto py-8">
          <Routes>
            {/* Route principale protégée */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            
            {/* Route Profil protégée */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            
            {/* Routes d'authentification */}
            <Route
              path="/login"
              element={
                user ? (
                  <Navigate to="/" replace />
                ) : (
                  <LoginForm onLoginSuccess={handleLoginSuccess} />
                )
              }
            />
            
            <Route
              path="/register"
              element={
                user ? (
                  <Navigate to="/" replace />
                ) : (
                  <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
                )
              }
            />

            {/* Rediriger toutes les autres routes vers la page d'accueil ou login */}
            <Route
              path="*"
              element={
                <Navigate to={user ? "/" : "/login"} replace />
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
