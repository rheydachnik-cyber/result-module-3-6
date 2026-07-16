import express from 'express';
import { addApplication, getApplicationsWithFilters, readDB, writeDB } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.post('/', async (req, res) => {
  try {
    const { fullName, phone, problem } = req.body;
    
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ message: 'ФИО обязательно для заполнения' });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({ message: 'Номер телефона обязателен' });
    }
    
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({ message: 'Введите корректный номер телефона' });
    }

    const application = addApplication({
      fullName: fullName.trim(),
      phone: phone.trim(),
      problem: problem ? problem.trim() : ''
    });

    res.status(201).json({
      message: 'Заявка успешно отправлена!',
      application
    });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});
router.get('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Доступ запрещен. Только для врачей.' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const result = getApplicationsWithFilters(page, limit, search);
    res.json(result);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});
router.get('/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Доступ запрещен. Только для врачей.' });
    }

    const db = readDB();
    const application = db.applications.find(app => app.id === parseInt(req.params.id));
    
    if (!application) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }
    
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Доступ запрещен. Только для врачей.' });
    }

    const db = readDB();
    const applicationId = parseInt(req.params.id);
    const applicationIndex = db.applications.findIndex(app => app.id === applicationId);
    
    if (applicationIndex === -1) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }
    const deletedApplication = db.applications[applicationIndex];
    db.applications.splice(applicationIndex, 1);
    writeDB(db);

    res.json({
      message: 'Заявка успешно удалена!',
      application: deletedApplication
    });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});
router.delete('/all', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Доступ запрещен. Только для врачей.' });
    }

    const db = readDB();
    const count = db.applications.length;
    
    if (count === 0) {
      return res.status(404).json({ message: 'Нет заявок для удаления' });
    }

    db.applications = [];
    db.idCounter = 1;
    writeDB(db);

    res.json({
      message: `Все ${count} заявок успешно удалены!`,
      deletedCount: count
    });
  } catch (error) {
    console.error('Error deleting all applications:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

export default router;
