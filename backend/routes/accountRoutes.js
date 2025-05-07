// backend/routes/accountRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const verifyToken = require('../middleware/authMiddleware');
const allowRole = require('../middleware/allowRole');
const router = express.Router();

// Получить все роли (только для руководителей)
router.get('/roles', async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM AccountRoles`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении ролей' });
  }
});

// Получить список всех аккаунтов (только для руководителей)
router.get('/', verifyToken, allowRole(['Руководитель']), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT a.id, a.username, ar.role_name, a.created_at
      FROM Accounts a
      JOIN AccountRoles ar ON a.role_id = ar.id
      ORDER BY a.id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении пользователей' });
  }
});

router.post('/competencies', verifyToken, allowRole(['Руководитель']), async (req, res) => {
  const { name, account_id } = req.body;
  if (!name || !account_id) return res.status(400).json({ message: 'Неполные данные' });

  try {
    await db.query(`INSERT INTO Competencies (name, account_id) VALUES ($1, $2)`, [name, account_id]);
    res.status(201).json({ message: 'Компетенция создана' });
  } catch (err) {
    console.error('Ошибка при создании компетенции:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.delete('/:id', verifyToken, allowRole(['Руководитель']), async (req, res) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM Accounts WHERE id = $1', [id]);
    res.json({ message: 'Пользователь успешно удалён' });
  } catch (err) {
    console.error('Ошибка при удалении пользователя:', err);
    res.status(500).json({ message: 'Ошибка при удалении пользователя' });
  }
});


router.patch('/profile', verifyToken, async (req, res) => {
  const { username, password } = req.body;
  const userId = req.user.id; // Получаем ID текущего пользователя

  try {
    const updates = [];

    // Если имя пользователя изменилось
    if (username) {
      updates.push(db.query(`UPDATE Accounts SET username = $1 WHERE id = $2`, [username, userId]));
    }

    // Если пароль изменился
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10); // Хешируем новый пароль
      updates.push(db.query(`UPDATE Accounts SET password = $1 WHERE id = $2`, [hashedPassword, userId]));
    }

    // Выполняем все обновления
    await Promise.all(updates);

    res.status(200).json({ message: 'Профиль успешно обновлён' });
  } catch (err) {
    console.error('Ошибка при редактировании профиля:', err);
    res.status(500).json({ message: 'Ошибка при обновлении профиля' });
  }
});


module.exports = router;
