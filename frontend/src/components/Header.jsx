import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isDoctor = user?.role === 'doctor';

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo-link">
          <h1 className="logo">
            Клиника «Здоровье»
          </h1>
        </Link>
        <nav className="nav">
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'active' : ''}
          >
            Запись
          </Link>
          {user && isDoctor && (
            <Link 
              to="/applications" 
              className={location.pathname === '/applications' ? 'active' : ''}
            >
              Заявки
            </Link>
          )}
          {user && isDoctor && (
            <Link 
              to="/users" 
              className={location.pathname === '/users' ? 'active' : ''}
            >
              Пациенты
            </Link>
          )}
          {user ? (
            <div className="user-info">
              <span className="user-role">
                {isDoctor ? 'Врач' : 'Пациент'}
              </span>
              <span className="user-name">{user.fullName}</span>
              <button onClick={handleLogout} className="logout-btn">
                Выйти
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-btn">
                Войти
              </Link>
              <Link to="/register" className="register-btn">
                Регистрация
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
