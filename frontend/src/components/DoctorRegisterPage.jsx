import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const DoctorRegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    secretKey: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (success) setSuccess('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.fullName.trim() || !formData.email || !formData.phone || !formData.password || !formData.secretKey) {
      setError('Заполните все поля');
      return;
    }

    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/auth/create-doctor', {
        fullName: formData.fullName.trim(),
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        secretKey: formData.secretKey
      });

      setSuccess('Врач успешно зарегистрирован! Теперь вы можете войти.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      setError(error.response?.data?.message || 'Ошибка регистрации врача');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card doctor-register-card">
        <div className="auth-header">
          <h2>Регистрация врача</h2>
          <p className="auth-subtitle">Только для медицинского персонала</p>
        </div>
        
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ФИО *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Петров Петр Петрович"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="doctor@clinic.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Номер телефона *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="+7 (___) ___-__-__"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Пароль *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Минимум 6 символов"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>🔒 Подтверждение пароля *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Повторите пароль"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Секретный ключ *</label>
            <input
              type="password"
              name="secretKey"
              value={formData.secretKey}
              onChange={handleChange}
              placeholder="Введите секретный ключ для регистрации врача"
              disabled={loading}
            />
            <div className="form-hint">Получите секретный ключ у администратора</div>
          </div>

          {error && <div className="form-error">{error}</div>}

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Регистрация...' : 'Зарегистрировать врача'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Уже есть аккаунт? <Link to="/login">Войти</Link></p>
          <p>Пациент? <Link to="/register">Регистрация для пациентов</Link></p>
        </div>
      </div>
    </div>
  );
};

export default DoctorRegisterPage;