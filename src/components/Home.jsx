import { useState } from 'react';
import TransactionModal from './TransactionModal';
import { getCurrentUser } from '../services/auth';
import ExpenseChart from './ExpenseChart';
import '../styles/Home.css';

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

      const response = await fetch('http://localhost/finance-flow/backend/api/transactions/add_transaction.php', {
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
    <div className="container">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Tableau de bord</h2>
      </div>

      <div className="balance-card">
        <h3 className="balance-title">Solde actuel</h3>
        <p className="balance-amount">
          {user?.balance.toLocaleString()}€
        </p>
      </div>

      <div className="chart-card">
        <ExpenseChart userId={user?.id} />
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="new-transaction-button"
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