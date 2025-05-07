import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import { useUser } from '../hooks/useUser';

function MethodologyManager() {
  const user = useUser();
  const [form, setForm] = useState({ name: '', content: '' });
  const [competencies, setCompetencies] = useState([]);
  const [selectedCompetencies, setSelectedCompetencies] = useState([]);
  const [methodologies, setMethodologies] = useState([]);
  const [methodologyCompetencies, setMethodologyCompetencies] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    axios.get('/competencies')
      .then(res => setCompetencies(res.data))
      .catch(() => setError('Ошибка при загрузке компетенций'));

    axios.get('/methodologies/my')
      .then(async res => {
        setMethodologies(res.data);
        const competencyMap = {};
        for (const m of res.data) {
          try {
            const compRes = await axios.get(`/methodologies/${m.id}/competencies`);
            competencyMap[m.id] = compRes.data;
          } catch {
            competencyMap[m.id] = [];
          }
        }
        setMethodologyCompetencies(competencyMap);
      })
      .catch(() => setError('Ошибка при загрузке методологий'));
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleCompetency = (id) => {
    setSelectedCompetencies(prev =>
      prev.includes(id)
        ? prev.filter(c => c !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/methodologies', form);
      const methodology_id = res.data.methodology_id;

      if (selectedCompetencies.length > 0) {
        await axios.post(`/methodologies/${methodology_id}/competencies`, {
          competency_ids: selectedCompetencies
        });
      }

      const updatedList = await axios.get('/methodologies/my');
      setMethodologies(updatedList.data);
      setForm({ name: '', content: '' });
      setSelectedCompetencies([]);
      alert('Методология успешно создана!');
      window.location.reload(); 
    } catch (err) {
      alert('Ошибка при создании методологии');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить методологию?')) return;
    try {
      await axios.delete(`/methodologies/${id}`);
      setMethodologies(methodologies.filter(m => m.id !== id));
    } catch (err) {
      alert('Ошибка при удалении методологии');
    }
  };

  if (!user || !['Учитель', 'Руководитель'].includes(user.role_name)) {
    return <p>Доступ запрещён</p>;
  }

  return (
    <div>
      <h2>Управление методологиями</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <h3>Создать методологию</h3>
        <input
          name="name"
          placeholder="Название методологии"
          value={form.name}
          onChange={handleChange}
          required
        />
        <textarea
          name="content"
          placeholder="Описание методологии"
          value={form.content}
          onChange={handleChange}
        />

        <h4>Выберите компетенции:</h4>
        <ul>
          {competencies.map(c => (
            <li key={c.id}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedCompetencies.includes(c.id)}
                  onChange={() => toggleCompetency(c.id)}
                />
                {c.name}
              </label>
            </li>
          ))}
        </ul>

        <button type="submit">Создать</button>
      </form>

      <h3>Мои методологии</h3>
      {methodologies.length === 0 ? (
        <p>У вас пока нет методологий.</p>
      ) : (
        <ul>
          {methodologies.map(m => (
            <li key={m.id} style={{ marginBottom: '20px' }}>
              <b>{m.name}</b>: {m.content?.slice(0, 100)}...
              <br />
              <i>Компетенции:</i>{' '}
              {methodologyCompetencies[m.id]?.length > 0
                ? methodologyCompetencies[m.id].map(c => c.name).join(', ')
                : 'Нет'}
              <br />
              <button
                onClick={() => handleDelete(m.id)}
                style={{ marginTop: '5px', color: 'red' }}
              >
                Удалить
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MethodologyManager;
