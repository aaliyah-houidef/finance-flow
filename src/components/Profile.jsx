import { useEffect, useState } from 'react';
import { getCurrentUser } from '../services/auth';
import '../styles/Profile.css';

const Profile = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterRecurrence, setFilterRecurrence] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('');
  const [sortType, setSortType] = useState('date');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const currentUser = getCurrentUser();
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Traduction des types de transaction
  const translateType = (type) => {
    const types = {
      'income': 'Entrée d\'argent',
      'expense': 'Dépense'
    };
    return types[type] || type;
  };

  // Traduction des méthodes de paiement
  const translatePaymentMethod = (method) => {
    const methods = {
      'card': 'Carte bancaire',
      'cash': 'Espèces',
      'transfer': 'Virement',
      'paypal': 'PayPal'
    };
    return methods[method] || method;
  };

  // Traduction des récurrences
  const translateRecurrence = (recurrence) => {
    const recurrences = {
      'monthly': 'Mensuelle',
      'weekly': 'Hebdomadaire',
      'none': 'Unique'
    };
    return recurrences[recurrence] || recurrence;
  };

  // Traduction des statuts de confirmation
  const translateConfirmation = (status) => {
    const statuses = {
      'pending': 'En attente',
      'confirmed': 'Confirmé',
      'rejected': 'Rejeté'
    };
    return statuses[status] || status;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transactionsResponse, categoriesResponse, subcategoriesResponse] = await Promise.all([
          fetch(`http://localhost/finance-flow/backend/api/transactions/get_transactions.php?user_id=${currentUser.id}`),
          fetch('http://localhost/finance-flow/backend/api/categories/get_categories.php'),
          fetch('http://localhost/finance-flow/backend/api/categories/get_subcategories.php')
        ]);

        const [transactionsData, categoriesData, subcategoriesData] = await Promise.all([
          transactionsResponse.json(),
          categoriesResponse.json(),
          subcategoriesResponse.json()
        ]);

        if (transactionsData.success) {
          setTransactions(transactionsData.transactions);
          setFilteredTransactions(transactionsData.transactions);
        }
        
        if (categoriesData.success) {
          setCategories(categoriesData.categories);
        }
        
        if (subcategoriesData.success) {
          setSubcategories(subcategoriesData.subcategories);
        }
      } catch (error) {
        setError('Erreur lors de la requête : ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser.id]);

  // Fonction pour obtenir le nom de la catégorie
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === parseInt(categoryId));
    return category ? category.name : 'Catégorie inconnue';
  };

  // Fonction pour obtenir le nom de la sous-catégorie
  const getSubcategoryName = (subcategoryId) => {
    const subcategory = subcategories.find(subcat => subcat.id === parseInt(subcategoryId));
    return subcategory ? subcategory.name : 'Sous-catégorie inconnue';
  };

  useEffect(() => {
    let filtered = transactions.filter(transaction =>
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.amount.toString().includes(searchTerm)
    );

    if (filterType) {
      filtered = filtered.filter(transaction => transaction.type === filterType);
    }

    if (filterRecurrence) {
      filtered = filtered.filter(transaction => transaction.recurrence === filterRecurrence);
    }

    if (filterPaymentMethod) {
      filtered = filtered.filter(transaction => transaction.payment_method === filterPaymentMethod);
    }

    if (sortType === 'amount-asc') {
      filtered.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
    } else if (sortType === 'amount-desc') {
      filtered.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
    } else if (sortType === 'date') {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    setFilteredTransactions(filtered);
  }, [searchTerm, filterType, filterRecurrence, filterPaymentMethod, sortType, transactions]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const openModal = (transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-6 dashboard-title">Profil - {currentUser?.username}</h2>
      <div className="bg-white shadow rounded-lg p-6 mb-6 main-transactions-container">
        <h3 className="text-xl font-semibold mb-4 chart-title">Mes transactions</h3>

        <input
          type="text"
          className="p-2 border rounded-md w-full mb-4 search-input"
          placeholder="Rechercher parmi vos transactions..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <div className='filters'>
          <div className="mb-4">
            <select
              className="p-2 border rounded-md"
              onChange={(e) => setFilterType(e.target.value)}
              value={filterType}
            >
              <option value="">Tous les types</option>
              <option value="income">Entrée d'argent</option>
              <option value="expense">Dépense</option>
            </select>
          </div>

          <div className="mb-4">
            <select
              className="p-2 border rounded-md"
              onChange={(e) => setFilterRecurrence(e.target.value)}
              value={filterRecurrence}
            >
              <option value="">Récurrence</option>
              <option value="monthly">Mensuel</option>
              <option value="weekly">Hebdomadaire</option>
              <option value="none">Unique</option>
            </select>
          </div>

          <div className="mb-4">
            <select
              className="p-2 border rounded-md"
              onChange={(e) => setFilterPaymentMethod(e.target.value)}
              value={filterPaymentMethod}
            >
              <option value="">Méthode de paiement</option>
              <option value="card">Carte bancaire</option>
              <option value="cash">Espèces</option>
              <option value="transfer">Virement</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>

          <div className="mb-4">
            <select
              className="p-2 border rounded-md"
              onChange={(e) => setSortType(e.target.value)}
              value={sortType}
            >
              <option value="date">Trier par date</option>
              <option value="amount-asc">Trier par montant croissant</option>
              <option value="amount-desc">Trier par montant décroissant</option>
            </select>
          </div>
        </div>
        {loading ? (
          <p>Chargement des transactions...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div className="space-y-4 transactions-container">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="transaction-infos cursor-pointer"
                  onClick={() => openModal(transaction)}
                >
                  <div>
                    <p className="text-gray-700 font-semibold">{transaction.description}</p>
                  </div>
                  <p className={`text-lg font-bold ${transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                    {transaction.type === 'expense' ? '-' : '+'}
                    {parseFloat(transaction.amount).toLocaleString('fr-FR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}€
                  </p>
                  <p className="text-gray-500">{new Date(transaction.date).toLocaleDateString('fr-FR')}</p>

                </div>
              ))
            ) : (
              <p>Aucune transaction trouvée.</p>
            )}
          </div>
        )}
      </div>

      {isModalOpen && selectedTransaction && (
        <div className="modal-overlay">
          <div className="modal-profil-container">
            <h3 className="text-2xl font-semibold mb-4 title-modal-container">Détails de la transaction</h3>
            <div className="transaction-modal">
              <strong>Description :</strong>
              <p>{selectedTransaction.description}</p>

              <strong>Montant :</strong>
              <p>
                {parseFloat(selectedTransaction.amount).toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}€
              </p>

              <strong>Date :</strong>
              <p>{new Date(selectedTransaction.date).toLocaleDateString('fr-FR')}</p>

              <strong>Type :</strong>
              <p>{translateType(selectedTransaction.type)}</p>

              <strong>Méthode de paiement :</strong>
              <p>{translatePaymentMethod(selectedTransaction.payment_method)}</p>

              <strong>Récurrence :</strong>
              <p>{translateRecurrence(selectedTransaction.recurrence)}</p>

              <strong>Catégorie :</strong>
              <p>{getCategoryName(selectedTransaction.id_category)}</p>

              <strong>Sous-catégorie :</strong>
              <p>{getSubcategoryName(selectedTransaction.id_subcategory)}</p>

              {selectedTransaction.payment_confirmation && (
                <>
                  <strong>Reçu :</strong>
                  <a
                    href={`http://localhost/finance-flow/backend/api/transactions/download_receipt.php?filename=${selectedTransaction.payment_confirmation}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Télécharger le reçu
                  </a>
                </>
              )}
            </div>
            <button
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              onClick={closeModal}
            >
              Fermer
            </button>
          </div>
        </div>
      )}


    </div>
  );
};

export default Profile;