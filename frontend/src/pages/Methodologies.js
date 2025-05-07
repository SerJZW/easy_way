import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import { useUser } from '../hooks/useUser';

function Methodologies() {
  const user = useUser();
  const [methodologies, setMethodologies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [competencies, setCompetencies] = useState([]);

  useEffect(() => {
    if (!user) return;
    axios.get('/methodologies').then(res => setMethodologies(res.data));
  }, [user]);

  const loadCompetencies = async (methodology_id) => {
    setSelected(methodology_id);
    try {
      const res = await axios.get(`/methodologies/${methodology_id}/competencies`);
      setCompetencies(res.data);
    } catch {
      alert('Ошибка при загрузке компетенций');
    }
  };

  return (
    <div>
      <h2>Методологии</h2>
      <ul>
        {methodologies.map(m => (
          <li key={m.id}>
            <b>{m.name}</b> — автор: {m.author}
            <button onClick={() => loadCompetencies(m.id)} style={{ marginLeft: '10px' }}>
              Показать компетенции
            </button>
          </li>
        ))}
      </ul>

      {selected && (
        <div>
          <h3>Компетенции методологии #{selected}</h3>
          <ul>
            {competencies.map(c => (
              <li key={c.id}>
                <b>{c.name}</b> — {c.description || 'Без описания'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Methodologies;
