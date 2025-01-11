import { useState } from 'react';
import TransactionModal from './TransactionModal';
import { getCurrentUser } from '../services/auth';

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(getCurrentUser());

  const handleAddTransaction = async (transactionData) => {
    try {
      // Créer un FormData pour envoyer le fichier
      const formData = new FormData();
      
      // Ajouter toutes les données de la transaction
      Object.keys(transactionData).forEach(key => {
        if (key === 'payment_confirmation' && transactionData[key]) {
          formData.append('payment_confirmation', transactionData[key]);
        } else {
          formData.append(key, transactionData[key]);
        }
      });

      const response = await fetch('http://localhost/my-fullstack-app/backend/api/transactions/add_transaction.php', {
        method: 'POST',
        body: formData // Ne pas définir le Content-Type header, le navigateur le fera automatiquement
      });

      const data = await response.json();

      if (data.success) {
        const updatedUser = {
          ...user,
          balance: data.new_balance
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        setIsModalOpen(false);
        alert('Transaction ajoutée avec succès !');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors de l\'ajout de la transaction');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Tableau de bord</h2>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Solde actuel</h3>
        <p className="text-3xl font-bold text-green-600">
          {user?.balance.toLocaleString()}€
        </p>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
      >
        Nouvelle Transaction
      </button>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTransaction}
      />
    </div>
  );
};

export default Home;