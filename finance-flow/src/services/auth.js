import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/my-fullstack-app/backend/api';

// Créer un événement personnalisé pour la mise à jour de l'authentification
export const authEvent = new EventTarget();

export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login.php`, credentials);
    
    if (typeof response.data === 'string') {
      const jsonStart = response.data.indexOf('{');
      const jsonData = JSON.parse(response.data.slice(jsonStart));
      response.data = jsonData;
    }

    if (response.data && response.data.success) {
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // Émettre un événement de connexion
        authEvent.dispatchEvent(new CustomEvent('authChange', { detail: response.data.user }));
        return response.data;
      } else {
        throw new Error('Données utilisateur manquantes dans la réponse');
      }
    } else {
      throw new Error(response.data.message || 'Erreur de connexion');
    }
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    throw error.response?.data || error;
  }
};

export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register.php`, userData);
    
    if (typeof response.data === 'string') {
      const jsonStart = response.data.indexOf('{');
      const jsonData = JSON.parse(response.data.slice(jsonStart));
      response.data = jsonData;
    }

    if (response.data.success) {
      // Ne pas connecter automatiquement l'utilisateur après l'inscription
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const logout = () => {
  localStorage.removeItem('user');
  // Émettre un événement de déconnexion
  authEvent.dispatchEvent(new CustomEvent('authChange', { detail: null }));
};

export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    localStorage.removeItem('user');
    return null;
  }
};