import React, { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '', role_id: '' });
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/accounts/roles').then(res => setRoles(res.data));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username || !form.password || !form.confirmPassword || !form.role_id) {
      setError('Пожалуйста, заполните все поля!');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Пароли не совпадают!');
      return;
    }

    try {
      await axios.post('/auth/register', form);
      alert('Регистрация успешна!');
      navigate('/login');
    } catch (err) {
      setError('Ошибка регистрации. Пожалуйста, попробуйте снова.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Регистрация</h2>
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
      <input
        type="password"
        name="confirmPassword"
        onChange={handleChange}
        placeholder="Повторите пароль"
        required
      />
      <select name="role_id" onChange={handleChange} required>
        <option value="">Выберите роль</option>
        {roles.map(r => (
          <option key={r.id} value={r.id}>{r.role_name}</option>
        ))}
      </select>
      {error && <p style={{ color: 'red' }}>{error}</p>} 
      <button type="submit">Зарегистрироваться</button>
      <p>Уже есть аккаунт? <Link to="/login">Войти</Link></p>
    </form>
  );
}

export default Register;
