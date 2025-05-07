import React, { useState, useEffect } from 'react';
import { useUser } from '../hooks/useUser';  
import axios from '../api/axiosInstance';  
import { Link } from 'react-router-dom';

function Profile() {
  const user = useUser(); 
  const [purchasedCourses, setPurchasedCourses] = useState([]);  
  const [createdCourses, setCreatedCourses] = useState([]);  
  const [totalSales, setTotalSales] = useState(0); // Для хранения суммы проданных курсов
  const [loading, setLoading] = useState(true);  
  const [editProfile, setEditProfile] = useState(false);  
  const [newUsername, setNewUsername] = useState(user?.username || ''); 
  const [newPassword, setNewPassword] = useState(''); 

  useEffect(() => {
    if (!user) return; 
    setLoading(true);  

    // Получаем купленные курсы
    axios.get('/purchases/my')
      .then((res) => {
        setPurchasedCourses(res.data);
      })
      .catch((error) => {
        console.error("Ошибка при получении купленных курсов:", error);
      });

    // Получаем созданные курсы
    if (user?.role_name === 'Руководитель' || user?.role_name === 'Амбассадор') {
      axios.get(`/purchases/created-by/${user?.id}`)
        .then((res) => {
          setCreatedCourses(res.data);
        })
        .catch((error) => {
          console.error("Ошибка при получении созданных курсов:", error);
        });
    }

    if (user?.role_name === 'Руководитель') {
      axios.get('/materials')
        .then((res) => {
          const total = res.data.reduce((acc, course) => acc + parseFloat(course.price), 0);
          const roundedTotal = total.toFixed(2); 
          setTotalSales(roundedTotal);
          setTotalSales(roundedTotal); 
        })
        .catch((error) => {
          console.error('Ошибка при получении данных о курсах:', error);
        });
    }

    setLoading(false);
  }, [user]);  

  const handleDelete = async (courseId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот курс?')) {
      try {
        await axios.delete(`/materials/${courseId}`);
        setCreatedCourses(createdCourses.filter(course => course.id !== courseId));
        alert('Курс успешно удалён');
      } catch (error) {
        console.error('Ошибка при удалении курса:', error);
        alert('Ошибка при удалении курса');
      }
    }
  };

  const handleDeletePurchase = async (purchaseId) => {
    if (window.confirm('Удалить этот курс из своих покупок?')) {
      try {
        await axios.delete(`/purchases/${purchaseId}`);
        setPurchasedCourses(prev => prev.filter(p => p.id !== purchaseId));
        alert('Курс удалён из списка покупок');
      } catch (err) {
        console.error('Ошибка при удалении курса:', err);
        alert('Ошибка при удалении курса');
      }
    }
  };

  const handleProfileEdit = async (e) => {
    e.preventDefault();
    try {
      const data = {};
      if (newUsername !== user.username) data.username = newUsername;
      if (newPassword) data.password = newPassword;

      const response = await axios.patch('/accounts/profile', data); 
      alert('Профиль успешно обновлён');
      setEditProfile(false); 
    } catch (error) {
      alert('Ошибка при обновлении профиля');
      console.error("Ошибка при редактировании профиля:", error);
    }
  };

  if (loading) {
    return <div>Загрузка...</div>; 
  }

  return (
    <div>
      <h2>Личный кабинет</h2>
      {user && <p>Здравствуйте, {user.username} ({user.role_name})</p>}
      {editProfile ? (
        <div>
          <h3>Редактировать профиль</h3>
          <form onSubmit={handleProfileEdit}>
            <div>
              <label>Имя:</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>
            <div>
              <label>Пароль:</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <button type="submit">Сохранить изменения</button>
            <button type="button" onClick={() => setEditProfile(false)}>
              Отмена
            </button>
          </form>
        </div>
      ) : (
        <button onClick={() => setEditProfile(true)}>Редактировать профиль</button>
      )}
        <h3>Сумма всех проданных курсов: {totalSales}₽</h3>
      {(user?.role_name === 'Учитель' || user?.role_name === 'Ученик') && (
        <div>
          <h3>Мои курсы</h3>
          {purchasedCourses.length === 0 ? (
            <p>У вас нет купленных курсов.</p>
          ) : (
            <ul>
              {purchasedCourses.map((course) => (
                <li key={course.id}>
                  <b>{course.title}</b>
                  <button
                    onClick={() => handleDeletePurchase(course.id)} >
                    Удалить
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Раздел для руководителей и амбассадоров */}
      {(user?.role_name === 'Руководитель' || user?.role_name === 'Амбассадор') && (
        <div>
          <h3>Мои купленные курсы</h3>
          {purchasedCourses.length === 0 ? (
            <p>У вас нет купленных курсов.</p>
          ) : (
            <ul>
              {purchasedCourses.map((course) => (
                <li key={course.id}>
                  <b>{course.title}</b>
                  <button
                    onClick={() => handleDeletePurchase(course.id)} >
                    Удалить
                  </button>
                </li>
              ))}
            </ul>
          )}

          <h3>Мои созданные курсы</h3>
          {createdCourses.length === 0 ? (
            <p>Вы еще не создали курсы.</p>
          ) : (
            <ul>
              {createdCourses.map((course) => (
                <li key={course.id}>
                  <b>{course.title}</b> — {course.price}₽
                  <button onClick={() => handleDelete(course.id)}>
                    Удалить
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default Profile;
