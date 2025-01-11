import { useState, useEffect } from 'react';
import { getUsers } from '../services/api';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsers();
        // Vérifions si la réponse est un tableau
        if (Array.isArray(response)) {
          setUsers(response);
        } else if (response.message) {
          // Si nous recevons un message d'erreur de l'API
          setError(response.message);
        } else {
          // Si la réponse n'est pas dans le format attendu
          setError('Format de données incorrect');
        }
        setLoading(false);
      } catch (err) {
        console.error('Erreur détaillée:', err);
        setError('Erreur lors de la récupération des utilisateurs');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Ajout d'un console.log pour debug
  console.log('Users data:', users);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  // Vérification supplémentaire avant le map
  if (!Array.isArray(users)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl">Les données ne sont pas dans le bon format</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Liste des Utilisateurs</h1>
      
      <div className="grid gap-4">
        {users.length > 0 ? (
          users.map((user) => (
            <div 
              key={user.id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
              <p className="text-gray-600 mt-1">{user.email}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">
            Aucun utilisateur trouvé
          </p>
        )}
      </div>
    </div>
  );
};

export default UserList;