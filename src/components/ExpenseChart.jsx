import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import '../styles/ExpenseChart.css';

const ExpenseChart = ({ userId }) => {
  const [categoryData, setCategoryData] = useState([]);
  const [subcategoryData, setSubcategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartSize, setChartSize] = useState({ innerRadius: 60, outerRadius: 120 });
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        const response = await fetch(
          `http://localhost/finance-flow/backend/api/transactions/get_expenses_by_category.php?user_id=${userId}`
        );
        const data = await response.json();

        if (data.success) {
          const categoryTotals = data.transactions.reduce((acc, transaction) => {
            const categoryId = transaction.id_category;
            const amount = parseFloat(parseFloat(transaction.amount).toFixed(2));
            const categoryName = transaction.category_name;

            if (!acc[categoryId]) {
              acc[categoryId] = {
                id: categoryId,
                name: categoryName,
                value: 0
              };
            }
            acc[categoryId].value = parseFloat((acc[categoryId].value + amount).toFixed(2));
            return acc;
          }, {});

          const chartData = Object.values(categoryTotals);
          setCategoryData(chartData);
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

  useEffect(() => {
    const fetchSubcategoryData = async () => {
      if (!selectedCategory) return;

      try {
        const response = await fetch(
          `http://localhost/finance-flow/backend/api/transactions/get_expenses_by_category.php?user_id=${userId}&category_id=${selectedCategory.id}`
        );
        const data = await response.json();

        if (data.success) {
          const subcategoryTotals = data.transactions.reduce((acc, transaction) => {
            const subcategoryId = transaction.id_subcategory;
            const amount = parseFloat(parseFloat(transaction.amount).toFixed(2));
            const key = subcategoryId || 'uncategorized';
            const subcategoryName = transaction.subcategory_name || 'Non catégorisé';

            if (!acc[key]) {
              acc[key] = {
                name: subcategoryName,
                value: 0
              };
            }
            acc[key].value = parseFloat((acc[key].value + amount).toFixed(2));
            return acc;
          }, {});

          const filteredData = Object.values(subcategoryTotals).filter(item => item.value > 0);
          setSubcategoryData(filteredData);
        }
      } catch (error) {
        console.error('Error fetching subcategory data:', error);
      }
    };

    fetchSubcategoryData();
  }, [selectedCategory, userId]);

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
        setChartSize({ innerRadius: 75, outerRadius: 120 });
        setIsSmallScreen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, value, name, index }) => {
    const RADIAN = Math.PI / 185;
    const radius = outerRadius * 1.4; // 
  
    // Calcul des coordonnées pour la ligne
    const lineStartRadius = outerRadius + 20; // Rayon de départ
    const lineEndRadius = radius - 10; // Rayon de fin
    const lineX1 = cx + lineStartRadius * Math.cos(-midAngle * RADIAN);
    const lineY1 = cy + lineStartRadius * Math.sin(-midAngle * RADIAN);
    const lineX2 = cx + lineEndRadius * Math.cos(-midAngle * RADIAN);
    const lineY2 = cy + lineEndRadius * Math.sin(-midAngle * RADIAN);
  
    const formattedValue = parseFloat(value).toFixed(2);
  
    // Décalage du label pour le placer à côté de la ligne
    const labelOffset = 21; // Ajuste la position du label
    const labelX = lineX2 + (lineX2 > cx ? labelOffset : -labelOffset);
    const labelY = lineY2 + (lineY2 > cy ? labelOffset : -labelOffset);
  
    return (
      <g>
        <line
          x1={lineX1}
          y1={lineY1}
          x2={lineX2}
          y2={lineY2}
          stroke={COLORS[index % COLORS.length]}
          strokeWidth={1}
        />
        <text
          x={labelX}
          y={labelY}
          fill={COLORS[index % COLORS.length]}
          textAnchor="middle"
          dominantBaseline="central"
          className="chart-label"
          style={{
            filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.5))',
            fontSize: isSmallScreen ? '8px' : '12px',
            fontWeight: 'bold',
          }}
        >
          {`${name} (${formattedValue}€)`}
        </text>
      </g>
    );
  };
  
  

  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="custom-tooltip">
          <p>{`${data.name}: ${parseFloat(data.value).toFixed(2)}€`}</p>
        </div>
      );
    }
    return null;
  };

  const handleClick = (data) => {
    setSelectedCategory(data);
  };

  const handleBackClick = () => {
    setSelectedCategory(null);
  };

  if (loading) {
    return <div className="text-center">Chargement...</div>;
  }

  if (categoryData.length === 0) {
    return <div className="no-data-message">Aucune transaction ajoutée.</div>;
  }

  const currentData = selectedCategory ? subcategoryData : categoryData;

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3 className="chart-title">
          {selectedCategory ? `Dépenses - ${selectedCategory.name}` : 'Mes dépenses:'}
        </h3>
      </div>
      
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={400}>
          <PieChart margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
            <Pie
              data={currentData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={chartSize.innerRadius}
              outerRadius={chartSize.outerRadius}
              fill="#8884d8"
              onClick={!selectedCategory ? handleClick : undefined}
              label={renderCustomizedLabel}
              labelLine={false}
            >
              {currentData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  style={{ cursor: !selectedCategory ? 'pointer' : 'default' }}
                />
              ))}
            </Pie>
            <Tooltip content={customTooltip} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {selectedCategory && (
        <div className="return-button">
          <button 
            onClick={handleBackClick}
            className="back-button"
          >
            Retour aux catégories
          </button>
        </div>
      )}
    </div>
  );
};

export default ExpenseChart;