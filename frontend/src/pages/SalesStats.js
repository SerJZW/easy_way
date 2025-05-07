import React, { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';

function SalesStats() {
  const [stats, setStats] = useState({ totalSales: 0, earnings: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('purchases/sales');
        setStats(res.data);
        setLoading(false);
      } catch (err) {
        setError('Ошибка при загрузке данных');
        setLoading(false);
        console.error('Ошибка при загрузке данных:', err);
      }
    };

    fetchStats();
  }, []);

  const handleWithdraw = () => {
    alert('Запрос на вывод средств отправлен!');
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Статистика продаж</h2>
      <p>Общее количество покупок: {stats.totalSales}</p>
      <p>Общий доход: {stats.earnings}₽</p>

      <button onClick={handleWithdraw} >
        Вывести средства
      </button>
    </div>
  );
}


export default SalesStats;
