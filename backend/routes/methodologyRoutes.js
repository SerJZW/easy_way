// backend/routes/methodologyRoutes.js
const express = require('express');
const db = require('../db');
const verifyToken = require('../middleware/authMiddleware');
const allowRole = require('../middleware/allowRole');
const router = express.Router();

// Получить все методологии
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT m.*, a.username AS author
      FROM Methodologies m
      JOIN Accounts a ON m.account_id = a.id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении методологий' });
  }
});

// Получить компетенции методологии
router.get('/:id/competencies', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(`
      SELECT c.*
      FROM MethodologyCompetencyRelations mcr
      JOIN Competencies c ON c.id = mcr.competency_id
      WHERE mcr.methodology_id = $1
    `, [id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении компетенций' });
  }
});

router.post('/', verifyToken, allowRole(['Учитель', 'Руководитель']), async (req, res) => {
  const { name, content } = req.body;
  const account_id = req.user.id;

  try {
    const result = await db.query(`
      INSERT INTO Methodologies (account_id, name, content)
      VALUES ($1, $2, $3)
      RETURNING id
    `, [account_id, name, content]);

    res.status(201).json({ methodology_id: result.rows[0].id });
  } catch (err) {
    console.error('Ошибка при создании методологии:', err);
    res.status(500).json({ message: 'Ошибка при создании методологии' });
  }
});

// Привязать компетенции к методологии
router.post('/:id/competencies', verifyToken, allowRole(['Учитель', 'Руководитель']), async (req, res) => {
  const { id } = req.params; 
  const { competency_ids } = req.body; 

  if (!Array.isArray(competency_ids) || competency_ids.length === 0) {
    return res.status(400).json({ message: 'Укажите список компетенций' });
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    for (const compId of competency_ids) {
      await client.query(`
        INSERT INTO MethodologyCompetencyRelations (methodology_id, competency_id)
        VALUES ($1, $2)
        ON CONFLICT (methodology_id, competency_id) DO NOTHING
      `, [id, compId]);
    }

    await client.query('COMMIT');
    res.status(200).json({ message: 'Компетенции успешно связаны' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Ошибка при привязке компетенций' });
  } finally {
    client.release();
  }
});

router.get('/my', verifyToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT m.*, a.username AS author
      FROM Methodologies m
      JOIN Accounts a ON m.account_id = a.id
      WHERE m.account_id = $1
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении ваших методологий' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Удаляем компетенции, связанные с методологией
    await db.query('DELETE FROM MethodologyCompetencyRelations WHERE methodology_id = $1', [id]);
    const result = await db.query(`
      DELETE FROM Methodologies 
      WHERE id = $1 AND account_id = $2
      RETURNING id
    `, [id, userId]);

    if (result.rowCount === 0) {
      return res.status(403).json({ message: 'Удаление запрещено' });
    }

    res.json({ message: 'Методология удалена' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при удалении методологии' });
  }
});

module.exports = router;
