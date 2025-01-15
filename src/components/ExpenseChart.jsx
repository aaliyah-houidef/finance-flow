import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import '../styles/ExpenseChart.css';

const ExpenseChart = ({ userId }) => {
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        const response = await fetch(`http://localhost/finance-flow/backend/api/transactions/get_transactions.php?user_id=${userId}`);
        const data = await response.json();

        if (data.success) {
          const expenses = data.transactions.filter(t => t.type === 'expense');
          
          const categoryTotals = expenses.reduce((acc, transaction) => {
            const categoryId = transaction.id_category;
            const amount = parseInt(transaction.amount);
            
            if (!acc[categoryId]) {
              acc[categoryId] = {
                amount: 0,
                category: getCategoryName(categoryId)
              };
            }
            acc[categoryId].amount += amount;
            return acc;
          }, {});

          const chartData = Object.entries(categoryTotals).map(([id, data]) => ({
            name: data.category,
            value: data.amount
          }));

          // Ne mettre à jour les données que si nous avons des dépenses
          if (chartData.length > 0) {
            setCategoryData(chartData);
          }
        }
      } catch (error) {
        console.error('Error fetching transaction data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchTransactionData();
    }
  }, [userId]);

  const getCategoryName = (categoryId) => {
    const categories = {
      1: 'Nourriture',
      2: 'Logement',
      3: 'Transport',
      4: 'Santé',
      5: 'Loisirs',
      6: 'Éducation',
      7: 'Finance',
      8: 'Famille',
      9: 'Vêtements et Soins',
      10: 'Autres'
    };
    return categories[categoryId] || 'Inconnu';
  };

  const COLORS = [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
    '#9966FF',
    '#FF9F40',
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0'
  ];

  if (loading) {
    return <div className="text-center">Chargement...</div>;
  }

  // Si pas de données, afficher un message
  if (loading) {
    return <div className="loading-text">Chargement...</div>;
  }

  if (categoryData.length === 0) {
    return (
      <div className="no-data-message">
        <h3 className="chart-title">Répartition des dépenses par catégorie</h3>
        <p>Aucune dépense trouvée pour générer le graphique.</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">Répartition des dépenses par catégorie</h3>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              fill="#8884d8"
              label={({ name, value }) => `${name}: ${value}€`}
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value}€`} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExpenseChart;