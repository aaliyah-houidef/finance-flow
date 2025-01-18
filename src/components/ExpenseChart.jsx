import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import '../styles/ExpenseChart.css';

const ExpenseChart = ({ userId }) => {
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartSize, setChartSize] = useState({ innerRadius: 60, outerRadius: 120 });
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        const response = await fetch(
          `http://localhost/finance-flow/backend/api/transactions/get_transactions.php?user_id=${userId}`
        );
        const data = await response.json();

        if (data.success) {
          const expenses = data.transactions.filter((t) => t.type === 'expense');

          const categoryTotals = expenses.reduce((acc, transaction) => {
            const categoryId = transaction.id_category;
            const amount = parseInt(transaction.amount);

            if (!acc[categoryId]) {
              acc[categoryId] = {
                amount: 0,
                category: getCategoryName(categoryId),
              };
            }
            acc[categoryId].amount += amount;
            return acc;
          }, {});

          const chartData = Object.entries(categoryTotals).map(([id, data]) => ({
            name: data.category,
            value: data.amount,
          }));

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
      10: 'Autres',
    };
    return categories[categoryId] || 'Inconnu';
  };

  const COLORS = [
    '#00b894',
    '#00cec9',
    '#0984e3',
    '#6c5ce7',
    '#fdcb6e',
    '#e17055',
    '#d63031',
    '#e84393',
    '#fd79a8',
    '#a29bfe',
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 500) {
        setChartSize({ innerRadius: 40, outerRadius: 80 });
        setIsSmallScreen(true);
      } else {
        setChartSize({ innerRadius: 60, outerRadius: 120 });
        setIsSmallScreen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return <div className="text-center">Chargement...</div>;
  }

  if (categoryData.length === 0) {
    return <div className="no-data-message">Aucune donnée disponible</div>;
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">Mes dépenses:</h3>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="80%">
          <PieChart>
            <Pie
              data={categoryData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={chartSize.innerRadius}
              outerRadius={chartSize.outerRadius}
              fill="#8884d8"
              label={({ name, value, index, cx, cy, midAngle, innerRadius, outerRadius }) => {
                const RADIAN = Math.PI / 180;
                const x = cx + (outerRadius + 20) * Math.cos(-midAngle * RADIAN);
                const y = cy + (outerRadius + 20) * Math.sin(-midAngle * RADIAN);

                if (isSmallScreen) {
                  return (
                    <text
                      x={x}
                      y={y - 10} // Adjusting the position for small screens
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="chart-label"
                      fill="white"
                    >
                      {`${name}\n${value}€`}
                    </text>
                  );
                }

                // For larger screens, adjust the position more appropriately
                const xLarge = cx + (outerRadius + 80) * Math.cos(-midAngle * RADIAN);
                const yLarge = cy + (outerRadius + 20) * Math.sin(-midAngle * RADIAN);

                return (
                  <text
                    x={xLarge}
                    y={yLarge}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="chart-label"
                    fill={COLORS[index % COLORS.length]}
                  >
                    {`${name}: ${value}€`}
                  </text>
                );
              }}
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExpenseChart;
