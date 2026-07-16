import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'patient'
  });
  const { user: currentUser, logout } = useAuth();

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (err) {
      console.error('Fetch users error:', err);
      if (err.response?.status === 401) {
        logout();
      } else if (err.response) {
        setError(err.response.data?.message || 'Ошибка загрузки пользователей');
      } else if (err.request) {
        setError('Сервер недоступен. Проверьте подключение.');
      } else {
        setError('Произошла ошибка при загрузке данных');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.fullName.trim()) {
      setError('Введите ФИО пациента');
      return;
    }
    if (!formData.email.trim()) {
      setError('Введите email пациента');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Введите номер телефона пациента');
      return;
    }
    if (!editingUser && !formData.password) {
      setError('Введите пароль для нового пациента');
      return;
    }
    if (formData.password && formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const dataToSend = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password || 'default123',
        role: 'patient'
      };

      console.log('Sending data:', dataToSend);

      const response = await axios.post('/api/users', dataToSend, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response:', response.data);

      setSuccess('Пациент успешно создан!');
      setFormData({ fullName: '', email: '', phone: '', password: '', role: 'patient' });
      setShowForm(false);
      fetchUsers();

      setTimeout(() => setSuccess(''), 3000);

    } catch (err) {
      console.error('Create patient error:', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
        setError(err.response.data?.message || 'Ошибка при создании пациента');
      } else if (err.request) {
        setError('❌ Сервер недоступен. Проверьте подключение.');
      } else {
        setError('Произошла ошибка. Попробуйте позже.');
      }
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пациента?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Пациент удален');
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка удаления');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleLabel = (role) => {
    return role === 'doctor' ? 'Врач' : 'Пациент';
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    value = value.replace(/\D/g, '');
    
    let formatted = '';
    if (value.length > 0) {
      if (value[0] !== '7') {
        value = '7' + value;
      }
      formatted = '+7';
      if (value.length > 1) {
        formatted += ' (' + value.substring(1, 4);
      }
      if (value.length >= 4) {
        formatted += ') ' + value.substring(4, 7);
      }
      if (value.length >= 7) {
        formatted += '-' + value.substring(7, 9);
      }
      if (value.length >= 9) {
        formatted += '-' + value.substring(9, 11);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      phone: formatted
    }));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader">Загрузка пациентов...</div>
      </div>
    );
  }

  return (
    <div className="users-container">
      <div className="users-header">
        <h2>Управление пациентами</h2>
        <button 
          className="btn-primary" 
          onClick={() => {
            setShowForm(!showForm);
            setError('');
            setSuccess('');
            if (!showForm) {
              setFormData({ fullName: '', email: '', phone: '', password: '', role: 'patient' });
            }
          }}
        >
          {showForm ? 'Отмена' : 'Добавить пациента'}
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {showForm && (
        <div className="user-form-card">
          <h3>Новый пациент</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>ФИО пациента *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Иванов Иван Иванович"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="patient@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Номер телефона *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="+7 (___) ___-__-__"
                required
              />
              <div className="form-hint">Формат: +7 (XXX) XXX-XX-XX</div>
            </div>

            <div className="form-group">
              <label>Пароль *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Минимум 6 символов"
                required
                minLength="6"
              />
            </div>

            <button type="submit" className="btn-primary">
              Создать пациента
            </button>
          </form>
        </div>
      )}

      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>ФИО</th>
              <th>Email</th>
              <th>Телефон</th>
              <th>Роль</th>
              <th>Дата регистрации</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">Нет пользователей</td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id}>
                  <td>#{user.id}</td>
                  <td><strong>{user.fullName}</strong></td>
                  <td>{user.email}</td>
                  <td>{user.phone || '—'}</td>
                  <td>{getRoleLabel(user.role)}</td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <div className="actions">
                      <button 
                        className="btn-delete" 
                        onClick={() => handleDelete(user.id)}
                        disabled={user.role === 'doctor' || user.id === currentUser?.id}
                        title={user.role === 'doctor' ? 'Нельзя удалить врача' : 'Удалить пациента'}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersManagement;