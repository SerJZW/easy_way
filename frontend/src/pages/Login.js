import React, { useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Пожалуйста, заполните все поля!');
      return;
    }

    try {
      const res = await axios.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Неверные данные для входа. Проверьте имя пользователя и пароль.');
      } else {
        setError('Ошибка при подключении к серверу. Попробуйте позже.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Вход</h2>
      <input
        name="username"
        onChange={handleChange}
        placeholder="Имя пользователя"
        required
      />
      <input
        type="password"
        name="password"
        onChange={handleChange}
        placeholder="Пароль"
        required
      />
      {error && <p style={{ color: 'red' }}>{error}</p>} 
      <button type="submit">Войти</button>
      <p>Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></p>
    </form>
  );
}

export default Login;
