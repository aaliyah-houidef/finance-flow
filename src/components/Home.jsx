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
      const formData = new FormData();
      Object.keys(transactionData).forEach(key => {
        if (key === 'payment_confirmation' && transactionData[key]) {
          formData.append('payment_confirmation', transactionData[key]);
        } else {
          formData.append(key, transactionData[key]);
        }
      });

      const response = await fetch('http://localhost/finance-flow/backend/api/transactions/add_transaction.php', {
        method: 'POST',
        body: formData
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
        <h3 className="balance-title">Solde :</h3>
        <p className="balance-amount">
          {user?.balance.toLocaleString()}€
        </p>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="new-transaction-button"
      >
        +
      </button>
      <p className="new-transaction-label">Nouvelle transaction</p>

      <div className="chart-card">
        <ExpenseChart userId={user?.id} />
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTransaction}
      />

    </div>
  );
};

export default Home;