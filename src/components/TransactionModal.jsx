import { useState, useEffect } from 'react';
import { getCurrentUser } from '../services/auth';
import '../styles/TransactionModal.css';

const TransactionModal = ({ isOpen, onClose, onSubmit }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [recurrence, setRecurrence] = useState('none');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const user = getCurrentUser();

  useEffect(() => {
    // Charger les catégories au montage du composant
    fetch('http://localhost/finance-flow/backend/api/categories/get_categories.php')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setCategories(data.categories);
        }
      })
      .catch(error => console.error('Error:', error));

    // Charger les sous-catégories
    fetch('http://localhost/finance-flow/backend/api/categories/get_subcategories.php')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setSubcategories(data.subcategories);
        }
      })
      .catch(error => console.error('Error:', error));
  }, []);

  useEffect(() => {
    // Filtrer les sous-catégories en fonction de la catégorie sélectionnée
    if (category) {
      const filtered = subcategories.filter(sub => sub.id_category === parseInt(category));
      setFilteredSubcategories(filtered);
      // Réinitialiser la sous-catégorie quand on change de catégorie
      setSubcategory('');
    } else {
      setFilteredSubcategories([]);
      setSubcategory('');
    }
  }, [category, subcategories]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        alert('Type de fichier non valide. Veuillez choisir une image (JPG, PNG, GIF) ou un PDF.');
        e.target.value = '';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Le fichier est trop volumineux. Taille maximum : 5MB');
        e.target.value = '';
        return;
      }

      setReceipt(file);

      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setReceipt(null);
    setPreviewUrl(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!description || !amount || !category || !subcategory) {
      alert('Veuillez remplir tous les champs obligatoires (description, montant, catégorie et sous-catégorie)');
      return;
    }

    // Convertir et formater le montant avec exactement 2 décimales
    const formattedAmount = parseFloat(parseFloat(amount).toFixed(2));

    const transactionData = {
      id_user: user.id,
      amount: formattedAmount,
      type,
      payment_method: paymentMethod,
      description,
      recurrence,
      id_category: parseInt(category),
      id_subcategory: parseInt(subcategory),
      payment_confirmation: receipt || null
    };

    onSubmit(transactionData);

    // Réinitialiser le formulaire
    setDescription('');
    setAmount('');
    setType('expense');
    setPaymentMethod('card');
    setRecurrence('none');
    setCategory('');
    setSubcategory('');
    setReceipt(null);
    setPreviewUrl(null);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <h2 className="modal-title">Nouvelle Transaction</h2>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              type="text"
              className="form-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ajouter une description..."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Montant</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="form-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Type</label>
            <select
              className="form-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="expense">Dépense</option>
              <option value="income">Entrée d'argent</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Méthode de paiement</label>
            <select
              className="form-select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="card">Carte bancaire</option>
              <option value="cash">Espèces</option>
              <option value="transfer">Virement</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Catégorie </label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Sélectionnez une catégorie</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Sous-catégorie </label>
            <select
              className="form-select"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              disabled={!category}
              required
            >
              <option value="">Sélectionnez une sous-catégorie</option>
              {filteredSubcategories.map(subcat => (
                <option key={subcat.id} value={subcat.id}>{subcat.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Récurrence</label>
            <select
              className="form-select"
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value)}
            >
              <option value="none">Unique</option>
              <option value="monthly">Mensuel</option>
              <option value="weekly">Hebdomadaire</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Justificatif de paiement (optionnel)</label>
            <div className="file-input-group">
              <input
                type="file"
                className="file-input"
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/gif,application/pdf"
              />
              {previewUrl && (
                <div className="file-preview-container">
                  <img src={previewUrl} alt="Aperçu du reçu" className="file-preview" />
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="file-remove-btn"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Ajouter
            </button>
        
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;