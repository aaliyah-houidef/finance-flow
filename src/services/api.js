import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/finance-flow/backend/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getUsers = async () => {
  try {
    const response = await api.get('/users/read.php');
    // Si la réponse contient des données au format string, on essaie de les parser
    const data = typeof response.data === 'string' 
      ? JSON.parse(response.data.substring(response.data.indexOf('[')))
      : response.data;
    
    console.log('Parsed data:', data);
    return data;
  } catch (error) {
    console.error('Error details:', error.response || error);
    throw error;
  }
};

export default api;