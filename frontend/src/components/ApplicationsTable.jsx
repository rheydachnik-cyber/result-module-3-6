import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ApplicationsTable = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedIds, setSelectedIds] = useState([]);
  const { user, logout } = useAuth();

  const isDoctor = user?.role === 'doctor';

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/applications', {
        params: {
          page: currentPage,
          limit: 10,
          search: search
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setApplications(response.data.applications);
      setTotalPages(response.data.totalPages);
      setTotalItems(response.data.total);
      setError('');
    } catch (err) {
      console.error('Fetch error:', err);
      if (err.response?.status === 401) {
        setError('Сессия истекла. Пожалуйста, войдите заново.');
        logout();
      } else if (err.response) {
        setError(err.response.data.message || 'Ошибка загрузки заявок');
      } else if (err.request) {
        setError('Сервер недоступен. Проверьте, запущен ли backend.');
      } else {
        setError('Произошла ошибка при загрузке данных');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isDoctor) {
      fetchApplications();
    }
  }, [currentPage, search, isDoctor]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту заявку?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/applications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('Заявка успешно удалена!');
      fetchApplications();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка удаления заявки');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      setError('Выберите заявки для удаления');
      return;
    }
    
    if (!window.confirm(`Удалить ${selectedIds.length} выбранных заявок?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      for (const id of selectedIds) {
        await axios.delete(`/api/applications/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setSuccess(` ${selectedIds.length} заявок успешно удалено!`);
      setSelectedIds([]);
      fetchApplications();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка удаления заявок');
    }
  };

  const handleDeleteAll = async () => {
    if (applications.length === 0) {
      setError('Нет заявок для удаления');
      return;
    }
    
    if (!window.confirm(`Удалить все ${applications.length} заявок? Это действие нельзя отменить!`)) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete('/api/applications/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess(`Все заявки успешно удалены!`);
      setSelectedIds([]);
      fetchApplications();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка удаления заявок');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === applications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(applications.map(app => app.id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sortedApplications = [...applications].sort((a, b) => {
    let aVal = a[sortField] || '';
    let bVal = b[sortField] || '';
    
    if (sortField === 'createdAt') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    } else if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  if (!isDoctor) {
    return (
      <div className="loading-container">
        <div className="loader">Доступ запрещен. Только для врачей.</div>
      </div>
    );
  }

  if (loading && applications.length === 0) {
    return (
      <div className="loading-container">
        <div className="loader">Загрузка заявок...</div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="table-header">
        <h2>Заявки пациентов</h2>
        <div className="table-controls">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="🔍 Поиск по ФИО, телефону или проблеме..."
              className="search-input"
            />
            <button type="submit" className="search-btn">🔍</button>
          </form>
          <span className="total-count">Всего: {totalItems} заявок</span>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {applications.length > 0 && (
        <div className="table-actions">
          <div className="table-actions-left">
            <label className="select-all-label">
              <input
                type="checkbox"
                checked={selectedIds.length === applications.length && applications.length > 0}
                onChange={toggleSelectAll}
              />
              Выбрать все
            </label>
            <span className="selected-count">
              Выбрано: {selectedIds.length}
            </span>
          </div>
          <div className="table-actions-right">
            {selectedIds.length > 0 && (
              <button 
                className="btn-delete-selected"
                onClick={handleDeleteSelected}
              >
                Удалить выбранные ({selectedIds.length})
              </button>
            )}
            <button 
              className="btn-delete-all"
              onClick={handleDeleteAll}
            >
              Удалить все
            </button>
          </div>
        </div>
      )}

      <div className="table-wrapper">
        <table className="applications-table">
          <thead>
            <tr>
              {applications.length > 0 && (
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.length === applications.length && applications.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
              )}
              <th onClick={() => handleSort('createdAt')} className="sortable">
                Дата отправки {sortField === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('fullName')} className="sortable">
                ФИО {sortField === 'fullName' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('phone')} className="sortable">
                Телефон {sortField === 'phone' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('problem')} className="sortable">
                Проблема {sortField === 'problem' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ width: '80px' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {sortedApplications.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">
                  {search ? 'Заявок не найдено' : 'Нет заявок'}
                </td>
              </tr>
            ) : (
              sortedApplications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(app.id)}
                      onChange={() => toggleSelect(app.id)}
                    />
                  </td>
                  <td>{formatDate(app.createdAt)}</td>
                  <td><strong>{app.fullName}</strong></td>
                  <td>{app.phone}</td>
                  <td className="problem-cell">{app.problem || '—'}</td>
                  <td>
                    <button 
                      className="btn-delete-single"
                      onClick={() => handleDelete(app.id)}
                      title="Удалить заявку"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="page-btn"
          >
            ⬅Назад
          </button>
          <span className="page-info">
            📄 Страница {currentPage} из {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            Вперед
          </button>
        </div>
      )}
    </div>
  );
};

export default ApplicationsTable;