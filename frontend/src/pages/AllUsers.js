import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import { useUser } from '../hooks/useUser';

function AllUsers() {
  const user = useUser();
  const [users, setUsers] = useState([]);
  const [competenciesRaw, setCompetenciesRaw] = useState([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [competencyInput, setCompetencyInput] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user || user.role_name !== 'Руководитель') return;

    axios.get('/accounts')
      .then(res => setUsers(res.data))
      .catch(() => setError('Не удалось загрузить пользователей'));

    axios.get('/competencies')
      .then(res => setCompetenciesRaw(res.data))
      .catch(() => setError('Не удалось загрузить компетенции'));
  }, [user]);

  const handleDelete = async (userId) => {
    if (window.confirm('Удалить пользователя?')) {
      try {
        await axios.delete(`/accounts/${userId}`);
        setUsers(users.filter(u => u.id !== userId));
        alert('Удалено');
      } catch {
        alert('Ошибка при удалении');
      }
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const handleAddCompetency = async () => {
    if (!competencyInput || !selectedUserId) return;

    try {
      await axios.post('/accounts/competencies', {
        name: competencyInput,
        account_id: selectedUserId
      });
      setMessage(`Добавлена компетенция: ${competencyInput}`);
      setCompetencyInput('');
      setSelectedUserId('');
      const res = await axios.get('/competencies');
      setCompetenciesRaw(res.data);
    } catch {
      setMessage('Ошибка при добавлении компетенции');
    }

    setTimeout(() => setMessage(''), 3000);
  };

  const getCompetencyList = (userId) => {
    return competenciesRaw
      .filter(c => c.account_id === userId)
      .map(c => c.name)
      .sort((a, b) => a.localeCompare(b));
  };

  const enrichedUsers = users.map(u => ({
    ...u,
    competencyList: getCompetencyList(u.id).join(', ')
  }));

  const sortedUsers = [...enrichedUsers].sort((a, b) => {
    const aKey = a[sortConfig.key] || '';
    const bKey = b[sortConfig.key] || '';
    if (aKey < bKey) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aKey > bKey) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredUsers = sortedUsers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(user.created_at).toLocaleDateString().includes(searchTerm) ||
    user.competencyList.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user || user.role_name !== 'Руководитель') return <p>Доступ запрещён</p>;

  return (
    <div>
      <h2>Список всех пользователей</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <input
        type="text"
        placeholder="Поиск по имени, роли, дате или компетенциям"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: '20px', padding: '8px', width: '100%' }}
      />

      <div style={{ marginBottom: '20px' }}>
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
        >
          <option value="">Выберите пользователя</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.username} (ID: {user.id})</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Новая компетенция"
          value={competencyInput}
          onChange={(e) => setCompetencyInput(e.target.value)}
          style={{ marginLeft: '10px' }}
        />

        <button onClick={handleAddCompetency} style={{ marginLeft: '10px' }}>
          Добавить компетенцию
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th><button onClick={() => handleSort('id')}>ID</button></th>
            <th><button onClick={() => handleSort('username')}>Имя</button></th>
            <th><button onClick={() => handleSort('role_name')}>Роль</button></th>
            <th><button onClick={() => handleSort('created_at')}>Дата</button></th>
            <th><button onClick={() => handleSort('competencyList')}>Компетенции</button></th>
            <th>Удалить</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length === 0 ? (
            <tr><td colSpan="6">Нет пользователей</td></tr>
          ) : (
            filteredUsers.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.role_name}</td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                <td>{u.competencyList || <i>Нет</i>}</td>
                <td>
                  <button onClick={() => handleDelete(u.id)} style={{ color: 'red' }}>
                    Удалить
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AllUsers;
