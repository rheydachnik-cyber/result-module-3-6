import express from 'express';
import { readDB, writeDB } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.get('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Доступ запрещен. Только для врачей.' });
    }
    const db = readDB();
    const users = db.users || [];
    res.json(users.map(({ password, ...user }) => user));
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});
router.get('/patients', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Доступ запрещен. Только для врачей.' });
    }
    const db = readDB();
    const users = db.users || [];
    const patients = users
      .filter(u => u.role === 'patient')
      .map(({ password, ...user }) => user);
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Доступ запрещен. Только для врачей.' });
    }

    const { email, password, fullName, phone } = req.body;
    if (!email || !password || !fullName || !phone) {
      return res.status(400).json({ 
        message: 'Все поля обязательны: email, password, fullName, phone' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Пароль должен содержать минимум 6 символов' 
      });
    }

    const db = readDB();
    const users = db.users || [];
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ 
        message: 'Пользователь с таким email уже существует' 
      });
    }
    let nextId = db.userIdCounter || 1;
    const newPatient = {
      id: nextId,
      email,
      password, 
      fullName: fullName.trim(),
      phone: phone.trim(),
      role: 'patient',
      createdAt: new Date().toISOString()
    };

    users.push(newPatient);
    db.users = users;
    db.userIdCounter = nextId + 1;
    writeDB(db);
    const { password: _, ...patientWithoutPassword } = newPatient;
    
    res.status(201).json({
      message: 'Пациент успешно создан!',
      user: patientWithoutPassword
    });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ 
      message: 'Ошибка при создании пациента',
      error: error.message 
    });
  }
});
router.get('/profile', authenticate, async (req, res) => {
  try {
    const db = readDB();
    const users = db.users || [];
    const user = users.find(u => u.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});
router.put('/:id', authenticate, async (req, res) => {
  try {
    const db = readDB();
    const users = db.users || [];
    const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));

    if (userIndex === -1) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const { fullName, phone } = req.body;
    if (fullName) users[userIndex].fullName = fullName;
    if (phone) users[userIndex].phone = phone;

    db.users = users;
    writeDB(db);

    const { password, ...userWithoutPassword } = users[userIndex];
    res.json(userWithoutPassword);
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
    const users = db.users || [];
    const userToDelete = users.find(u => u.id === parseInt(req.params.id));

    if (!userToDelete) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    if (userToDelete.role === 'doctor') {
      return res.status(403).json({ message: 'Нельзя удалить врача' });
    }

    const filteredUsers = users.filter(u => u.id !== parseInt(req.params.id));
    db.users = filteredUsers;
    writeDB(db);
    res.json({ message: 'Пользователь удален' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

export default router;