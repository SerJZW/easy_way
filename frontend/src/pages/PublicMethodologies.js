import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';

function PublicMethodologies() {
  const [methodologies, setMethodologies] = useState([]);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [competencies, setCompetencies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');  // Состояние для поиска

  useEffect(() => {
    axios.get('/methodologies')
      .then(res => setMethodologies(res.data))
      .catch(() => setError('Не удалось загрузить методологии'));
  }, []);

  const toggleCompetencies = async (methodologyId) => {
    if (selectedId === methodologyId) {
      setSelectedId(null);
      setCompetencies([]);
    } else {
      try {
        const res = await axios.get(`/methodologies/${methodologyId}/competencies`);
        setCompetencies(res.data);
        setSelectedId(methodologyId);
      } catch {
        setCompetencies([]);
        setSelectedId(null);
      }
    }
  };

  // Фильтрация методологий по названию
  const filteredMethodologies = methodologies.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())  // Фильтрация по названию
  );

  return (
    <div>
      <h2>Методологии</h2>

      {/* Поле для поиска */}
      <input
        type="text"
        placeholder="Поиск по названию методологии"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}  // Обновляем поисковый запрос
        style={{ marginBottom: '20px', padding: '8px', width: '100%' }}
      />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {filteredMethodologies.length === 0 ? (
        <p>Методологии не найдены</p>
      ) : (
        <ul>
          {filteredMethodologies.map(m => (
            <li key={m.id} style={{ marginBottom: '20px' }}>
              <b>{m.name}</b> <i>(Автор: {m.author})</i>
              <p>{m.content}</p>
              <button onClick={() => toggleCompetencies(m.id)}>
                {selectedId === m.id ? 'Скрыть компетенции' : 'Показать компетенции'}
              </button>
              {selectedId === m.id && (
                <ul style={{ marginTop: '10px' }}>
                  {competencies.length === 0
                    ? <li>Нет компетенций</li>
                    : competencies.map(c => <li key={c.id}>{c.name}</li>)}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PublicMethodologies;
