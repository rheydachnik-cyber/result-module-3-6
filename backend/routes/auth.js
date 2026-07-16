import express from 'express';
import jwt from 'jsonwebtoken';
import { readDB, writeDB } from '../db.js';

const router = express.Router();
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;

    if (!email || !password || !fullName || !phone) {
      return res.status(400).json({ message: 'Все поля обязательны' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Пароль должен содержать минимум 6 символов' });
    }

    const db = readDB();
    const users = db.users || [];

    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    let nextId = db.userIdCounter || 1;
    const newUser = {
      id: nextId,
      email,
      password,
      fullName,
      phone,
      role: 'patient',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    db.users = users;
    db.userIdCounter = nextId + 1;
    writeDB(db);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, fullName: newUser.fullName },
      process.env.JWT_SECRET || 'your_super_secret_jwt_key_12345',
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      token,
      user: userWithoutPassword,
      message: 'Регистрация успешна!'
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email и пароль обязательны' });
    }

    const db = readDB();
    const users = db.users || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, fullName: user.fullName },
      process.env.JWT_SECRET || 'your_super_secret_jwt_key_12345',
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Токен не предоставлен' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_12345');
    const db = readDB();
    const users = db.users || [];
    const user = users.find(u => u.id === decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    res.status(401).json({ message: 'Неверный токен' });
  }
});

router.post('/create-doctor', async (req, res) => {
  try {
    const { email, password, fullName, phone, secretKey } = req.body;

    const DOCTOR_SECRET_KEY = 'doctor_secret';

    if (secretKey !== DOCTOR_SECRET_KEY) {
      return res.status(403).json({ message: 'Неверный секретный ключ' });
    }

    if (!email || !password || !fullName || !phone) {
      return res.status(400).json({ message: 'Все поля обязательны' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Пароль должен содержать минимум 6 символов' });
    }

    const db = readDB();
    const users = db.users || [];

    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    let nextId = db.userIdCounter || 1;
    const newDoctor = {
      id: nextId,
      email,
      password,
      fullName,
      phone,
      role: 'doctor',
      createdAt: new Date().toISOString()
    };

    users.push(newDoctor);
    db.users = users;
    db.userIdCounter = nextId + 1;
    writeDB(db);

    const { password: _, ...doctorWithoutPassword } = newDoctor;
    res.status(201).json({
      doctor: doctorWithoutPassword,
      message: 'Врач успешно создан!'
    });
  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

export default router;