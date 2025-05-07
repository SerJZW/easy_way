import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import { useUser } from '../hooks/useUser';

function Dashboard() {
  const user = useUser();
  const [materials, setMaterials] = useState([]);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    axios.get('/materials')
      .then((res) => {
        setMaterials(res.data);
      })
      .catch(() => setLoading(false));

    axios.get('/purchases/my-courses')
      .then((res) => {
        setPurchasedCourses(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  const handleBuy = async (material_id) => {
    try {
      await axios.post('/purchases/buy', { course_material_id: material_id });
      alert('Курс куплен!');
      
      setPurchasedCourses(prev => [...prev, { id: material_id }]);
    } catch (err) {
      alert('Вы уже приобрели этот курс или произошла ошибка.');
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  const isPurchased = (courseId) => {
    return purchasedCourses.some(course => course.id === courseId);
  };

  const displayedCourses = materials.slice(0, 5);

  return (
    <div>
      <h2>Добро пожаловать, {user?.username}!</h2>

      <div className="app-description">
        <h3>О приложении</h3>
        <p>
          Добро пожаловать на платформу для обучения, где студенты и школьники могут легко найти курсы для подготовки к учебе и экзаменам.
          На нашей платформе вы найдете тщательно подобранные учебные материалы, которые помогут вам лучше понять сложные темы и подготовиться к экзаменам.
          Мы предлагаем курсы по различным предметам: от технических дисциплин до гуманитарных наук, чтобы вы могли улучшить свои знания в любых областях.
          Для студентов, которые хотят делиться своими методиками и зарабатывать, наша платформа предоставляет возможность стать автором курса — загрузите свои материалы, делитесь знаниями и получайте доход.
          Независимо от того, хотите ли вы углубить свои знания или стать автором учебных материалов, наша платформа предоставит вам все необходимое для достижения ваших целей!
        </p>
      </div>

      <h3>Последние добавленные курсы:</h3>
      <div className="product-list">
        {displayedCourses.map((mat) => (
          <div key={mat.id} className="product-card">
            <h4>{mat.title}</h4>
            <p>{mat.description}</p>
            <div className="card-footer">
              <span>{mat.price}₽</span>
              {!isPurchased(mat.id) ? (
                <button onClick={() => handleBuy(mat.id)}>Купить</button>
              ) : (
                <span>Вы уже купили этот курс</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
