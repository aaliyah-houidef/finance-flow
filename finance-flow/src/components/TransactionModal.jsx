import { useState, useEffect } from 'react';
import { getCurrentUser } from '../services/auth';

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
    fetch('http://localhost/my-fullstack-app/backend/api/categories/get_categories.php')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setCategories(data.categories);
        }
      })
      .catch(error => console.error('Error:', error));

    // Charger les sous-catégories
    fetch('http://localhost/my-fullstack-app/backend/api/categories/get_subcategories.php')
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
    } else {
      setFilteredSubcategories([]);
    }
  }, [category, subcategories]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        alert('Type de fichier non valide. Veuillez choisir une image (JPG, PNG, GIF) ou un PDF.');
        e.target.value = '';
        return;
      }

      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Le fichier est trop volumineux. Taille maximum : 5MB');
        e.target.value = '';
        return;
      }

      setReceipt(file);

      // Créer une URL de prévisualisation pour les images
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  // Permettre de retirer le fichier
  const handleRemoveFile = () => {
    setReceipt(null);
    setPreviewUrl(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!amount || !category) {
      alert('Veuillez remplir les champs obligatoires (montant et catégorie)');
      return;
    }

    const transactionData = {
      id_user: user.id,
      amount: parseFloat(amount),
      type,
      payment_method: paymentMethod,
      description: description || 'Sans description',
      recurrence,
      id_category: parseInt(category),
      id_subcategory: subcategory ? parseInt(subcategory) : null,
      payment_confirmation: receipt || null // Explicitement null si pas de reçu
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/2 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Nouvelle Transaction</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Description (optionnelle)</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ajouter une description..."
            />
          </div>

          <div>
            <label className="block mb-1">Montant *</label>
            <input
              type="number"
              step="0.01"
              className="w-full p-2 border rounded"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1">Type</label>
            <select
              className="w-full p-2 border rounded"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="expense">Dépense</option>
              <option value="income">Entrée d'argent</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">Méthode de paiement</label>
            <select
              className="w-full p-2 border rounded"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="card">Carte bancaire</option>
              <option value="cash">Espèces</option>
              <option value="transfer">Virement</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">Récurrence</label>
            <select
              className="w-full p-2 border rounded"
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value)}
            >
              <option value="none">Unique</option>
              <option value="monthly">Mensuel</option>
              <option value="weekly">Hebdomadaire</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">Catégorie *</label>
            <select
              className="w-full p-2 border rounded"
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

          <div>
            <label className="block mb-1">Sous-catégorie (optionnelle)</label>
            <select
              className="w-full p-2 border rounded"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              disabled={!category}
            >
              <option value="">Sélectionnez une sous-catégorie</option>
              {filteredSubcategories.map(subcat => (
                <option key={subcat.id} value={subcat.id}>{subcat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1">Justificatif de paiement (optionnel)</label>
            <div className="space-y-2">
              <input
                type="file"
                className="w-full p-2 border rounded"
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/gif,application/pdf"
              />
              {previewUrl && (
                <div className="relative">
                  <img src={previewUrl} alt="Aperçu du reçu" className="max-w-xs rounded-lg shadow" />
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;