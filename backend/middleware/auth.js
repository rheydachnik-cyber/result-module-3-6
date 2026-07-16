import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Доступ запрещен. Требуется авторизация.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_12345');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Неверный токен авторизации.' });
  }
};
