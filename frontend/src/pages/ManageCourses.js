import React, { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';

function ManageCourses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    axios.get('/my-courses').then(res => setCourses(res.data));
  }, []);

  const handleDelete = async (courseId) => {
    try {
      await axios.delete(`/courses/${courseId}`);
      setCourses(courses.filter(course => course.id !== courseId));
    } catch (err) {
      alert('Ошибка при удалении курса');
    }
  };

  return (
    <div>
      <h2>Мои курсы</h2>
      <ul>
        {courses.map(course => (
          <li key={course.id}>
            {course.title} — {course.price}₽
            <button onClick={() => handleDelete(course.id)}>Удалить</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ManageCourses;
