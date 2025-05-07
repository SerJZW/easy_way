// backend/routes/templateRoutes.js
const express = require('express');
const db = require('../db');
const verifyToken = require('../middleware/authMiddleware');
const allowRole = require('../middleware/allowRole');
const router = express.Router();

// Получить все шаблоны курсов (только авторизованные)
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM CourseTemplates');
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка при получении шаблонов:', err);
    res.status(500).json({ message: 'Ошибка на сервере' });
  }
});

// Создать шаблон курса (только для "Руководитель")
router.post('/', verifyToken, allowRole(['Руководитель']), async (req, res) => {
  const { name, content } = req.body;

  if (!name || !content) {
    return res.status(400).json({ message: 'Укажите название и содержимое шаблона' });
  }

  try {
    const result = await db.query(`
      INSERT INTO CourseTemplates (name, content)
      VALUES ($1, $2)
      RETURNING id
    `, [name, content]);

    res.status(201).json({ template_id: result.rows[0].id });
  } catch (err) {
    if (err.code === '23505') {
      res.status(400).json({ message: 'Шаблон с таким именем уже существует' });
    } else {
      res.status(500).json({ message: 'Ошибка при создании шаблона' });
    }
  }
});

router.delete('/:id', verifyToken, allowRole(['Руководитель']), async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM CourseTemplates WHERE id = $1', [id]);
    res.json({ message: 'Шаблон удалён' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при удалении шаблона' });
  }
});
module.exports = router;
