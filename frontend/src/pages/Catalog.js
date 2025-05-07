import React, { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';

function Catalog() {
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({
    author: '',
    minPrice: 0,
    maxPrice: 1000
  });
  const [purchasedCourses, setPurchasedCourses] = useState([]); 

  useEffect(() => {
    axios.get('/materials/author')
      .then(res => setCourses(res.data))
      .catch(error => console.error("Ошибка при получении курсов:", error));

    axios.get('/purchases/my')
      .then(res => setPurchasedCourses(res.data.map(purchase => purchase.course_material_id)))
      .catch(error => console.error("Ошибка при получении купленных курсов:", error));
  }, []);

  // Обработка изменений фильтров
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // Фильтрация курсов по автору и цене
  const filteredCourses = courses.filter(course => {
    return (
      (filters.author ? course.author_name.toLowerCase().includes(filters.author.toLowerCase()) : true) &&
      (course.price >= filters.minPrice && course.price <= filters.maxPrice)
    );
  });

  // Обработчик для покупки курса
  const handlePurchase = async (courseId) => {
    try {
      const response = await axios.post('/purchases/buy', { course_material_id: courseId });
      alert('Курс успешно куплен!');

      setPurchasedCourses(prev => [...prev, courseId]);  
    } catch (err) {
      alert('Ошибка при покупке курса. Вы могли уже приобрести этот курс.');
      console.error('Ошибка при покупке курса:', err);
    }
  };

  return (
    <div>
      <h2>Каталог курсов</h2>
      <div>
        <label>Автор:</label>
        <input type="text" name="author" onChange={handleFilterChange} placeholder="Поиск по автору" />
      </div>

      <div>
        <label>Цена:</label>
        <input type="number" name="minPrice" value={filters.minPrice} onChange={handleFilterChange} placeholder="От" />
        <input type="number" name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} placeholder="До" />
      </div>

      <div>
        <ul>
          {filteredCourses.map(course => (
            <li key={course.id}>
              <p>{course.title}</p> 
              <p>{course.description}</p>
              <p>{course.price}₽</p>
              <p>Автор: {course.author_name}</p> 
              <button 
                onClick={() => handlePurchase(course.id)}
                disabled={purchasedCourses.includes(course.id)}  
              >
                {purchasedCourses.includes(course.id) ? 'Курс куплен' : 'Купить'}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Catalog;
