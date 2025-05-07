const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const verifyToken = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await db.query('SELECT * FROM Accounts WHERE username = $1', [username]);
  if (!user.rows.length) return res.status(401).json({ message: 'Пользователь не найден' });

  const match = await bcrypt.compare(password, user.rows[0].password);
  if (!match) return res.status(401).json({ message: 'Неверный пароль' });

  const token = jwt.sign({
    id: user.rows[0].id,
    role_id: user.rows[0].role_id,
    username: user.rows[0].username
  }, process.env.JWT_SECRET, { expiresIn: '8h' });

  res.json({ token });
});

router.post('/register', async (req, res) => {
  const { username, password, role_id } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const existing = await db.query('SELECT * FROM Accounts WHERE username = $1', [username]);
    if (existing.rows.length) return res.status(400).json({ message: 'Пользователь уже существует' });

    const newUser = await db.query(`
      INSERT INTO Accounts (username, password, role_id)
      VALUES ($1, $2, $3) RETURNING id
    `, [username, hashed, role_id]);

    res.status(201).json({ id: newUser.rows[0].id });
  } catch (e) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await db.query(`
        SELECT a.id, a.username, ar.role_name
        FROM Accounts a
        JOIN AccountRoles ar ON a.role_id = ar.id
        WHERE a.id = $1
      `, [req.user.id]);

    if (!user.rows.length) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json(user.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
