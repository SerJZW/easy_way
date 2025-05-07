import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import { useUser } from '../hooks/useUser';

function ManageTemplates() {
  const user = useUser();
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState({ name: '', content: '' });

  useEffect(() => {
    if (!user || user.role_name !== 'Руководитель') return;
    axios.get('/templates').then(res => setTemplates(res.data));
  }, [user]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('/templates', form);
      alert('Шаблон создан!');
      const res = await axios.get('/templates');
      setTemplates(res.data);
      setForm({ name: '', content: '' });
    } catch (err) {
      alert('Ошибка при создании шаблона');
    }
  };

  if (!user || user.role_name !== 'Руководитель') {
    return <p>Доступ запрещён</p>;
  }
  const handleDelete = async (id) => {
    if (!window.confirm('Удалить этот шаблон?')) return;
    try {
      await axios.delete(`/templates/${id}`);
      const res = await axios.get('/templates');
      setTemplates(res.data);
    } catch {
      alert('Ошибка при удалении');
    }
  };

  return (
    <div>
      <h2>Управление шаблонами курсов</h2>

      <form onSubmit={handleSubmit}>
        <h3>Создать новый шаблон</h3>
        <input
          name="name"
          placeholder="Название шаблона"
          value={form.name}
          onChange={handleChange}
          required
        />
        <textarea
          name="content"
          placeholder="Содержание шаблона"
          value={form.content}
          onChange={handleChange}
        />
        <button type="submit">Создать</button>
      </form>

      <h3>Список существующих шаблонов:</h3>
      <ul>
  {templates.map(t => (
    <li key={t.id}>
      <b>{t.name}</b>: {t.content.slice(0, 50)}...
      <button onClick={() => handleDelete(t.id)} style={{ marginLeft: '10px' }}>
        Удалить
      </button>
    </li>
  ))}
</ul>
    </div>
  );
}

export default ManageTemplates;
