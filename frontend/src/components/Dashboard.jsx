import { useState, useEffect } from 'react';
import api from '../api';
import { Package, Users, ShoppingCart, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get('/summary');
        setSummary(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard summary');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <div className="text-gray-500 text-center py-10">Loading dashboard...</div>;
  if (error) return <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>;

  const cards = [
    { title: 'Total Products', value: summary?.total_products, icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Total Customers', value: summary?.total_customers, icon: Users, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Total Orders', value: summary?.total_orders, icon: ShoppingCart, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Low Stock Products', value: summary?.low_stock_products, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm p-6 flex items-center space-x-4">
              <div className={`p-4 rounded-full ${card.bg} ${card.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{card.title}</p>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
