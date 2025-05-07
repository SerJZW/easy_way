// frontend/Purchases.js
import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import { useUser } from '../hooks/useUser';

function Purchases() {
  const user = useUser();
  const [purchases, setPurchases] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    axios.get('/purchases/my').then(res => setPurchases(res.data));
  }, [user]);

  const handleDownload = async (courseMaterialId) => {
    try {
      console.log('Запрос на скачивание курса с ID:', courseMaterialId);

      const response = await axios.get(`/purchases/download/${courseMaterialId}`, { responseType: 'blob' });

      console.log('Ответ от сервера:', response);

      const file = new Blob([response.data], { type: response.headers['content-type'] });
      const link = document.createElement('a');
      
      const filename = response.headers['content-disposition']
        ? response.headers['content-disposition'].split('filename=')[1]
        : 'downloaded-file';
      link.href = URL.createObjectURL(file);
      link.download = filename;
      link.click();
    } catch (err) {
      console.error('Ошибка при скачивании файла:', err);
      setError('Ошибка при скачивании файла');
    }
  };

  return (
    <div>
      <h2>Мои покупки</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {purchases.length === 0 && <p>Нет купленных курсов</p>}
      <ul>
        {purchases.map((purchase) => (
          <li key={purchase.id}>
            <b>{purchase.title}</b>
            <p>{purchase.description}</p>
            <button 
              onClick={() => handleDownload(purchase.course_material_id)} 
              style={{ marginLeft: '10px' }}>
              Скачать
            </button>
          </li>
        ))}
      </ul>
    </div>
  );  
}

export default Purchases;
