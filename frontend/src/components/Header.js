import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../hooks/useUser';

function Header() {
  const user = useUser();

  return (
    <header style={styles.header}>
      <div style={styles.logo}>
        <Link to="/dashboard">Easy Way</Link>
      </div>
      <nav style={styles.nav}>
        {user ? (
          <>
            <Link to="/profile">Личный кабинет</Link>
            <Link to="/catalog">Каталог</Link>
            <Link to="/purchases">Мои покупки</Link>
            <Link to="/publicmethodologies">Методологии</Link>

            {user.role_name === 'Руководитель' && (
              <>
                <Link to="/create">Создать курс</Link>
                <Link to="/templates">Управление шаблонами</Link>
                <Link to="/users">Список пользователей</Link>
              </>
            )}
            {user.role_name === 'Амбассадор' && (
              <>
                <Link to="/create">Загрузить новый курс</Link>
                <Link to="/sales">Статистика продаж</Link>
              </>
            )}
            {['Руководитель','Учитель'].includes(user.role_name) && (
              <Link to="/create-methodology">Создать методологию</Link>
            )}

            <button onClick={handleLogout}>Выход</button>
          </>
        ) : (
          <>
            <Link to="/login">Войти</Link>
            <Link to="/register">Регистрация</Link>
          </>
        )}
      </nav>
    </header>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 30px',
    backgroundColor: '#2c2c2c',
    color: 'white',
  },
  logo: {
    fontSize: '1.8rem',
    fontWeight: '600',
  },
  nav: {
    display: 'flex',
    gap: '20px',
  },
  button: {
    backgroundColor: '#4CAF50',
    border: 'none',
    color: 'white',
    padding: '10px 20px',
    cursor: 'pointer',
  },
};

function handleLogout() {
  localStorage.removeItem('token');
  window.location.href = '/login';
}

export default Header;
