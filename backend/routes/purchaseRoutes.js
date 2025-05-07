const express = require('express');
const db = require('../db');
const verifyToken = require('../middleware/authMiddleware');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Совершить покупку (только авторизованный пользователь)
router.post('/buy', verifyToken, async (req, res) => {
  const ambassador_id = req.user.id;
  const account_id = req.user.id;
  const { course_material_id } = req.body;

  try {
    const result = await db.query(`
      INSERT INTO Purchases (ambassador_id, course_material_id, account_id)
      VALUES ($1, $2, $3) RETURNING id
    `, [ambassador_id, course_material_id, account_id]);

    res.status(201).json({ purchase_id: result.rows[0].id });
  } catch (e) {
    res.status(400).json({ message: 'Вы уже купили этот курс или произошла ошибка' });
  }
});

router.get('/download/:course_material_id', verifyToken, async (req, res) => {
  const ambassador_id = req.user.id;
  const { course_material_id } = req.params;

  try {
    const result = await db.query(`
      SELECT file_url
      FROM CourseMaterials
      WHERE id = $1 AND created_by = $2
    `, [course_material_id, ambassador_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Курс не найден или у вас нет доступа к нему.' });
    }

    const fileUrl = result.rows[0].file_url;
    const filePath = path.join(__dirname, '..', 'files', fileUrl);

    console.log("Путь к файлу:", filePath);
    if (!fs.existsSync(filePath)) {
      console.error('Файл не найден:', filePath);
      return res.status(404).json({ message: 'Файл не найден.' });
    }
    await db.query(`
      UPDATE Purchases
      SET is_downloaded = TRUE, downloaded_at = CURRENT_TIMESTAMP
      WHERE ambassador_id = $1 AND course_material_id = $2
    `, [ambassador_id, course_material_id]);

    res.download(filePath, path.basename(filePath), (err) => {
      if (err) {
        console.error('Ошибка при скачивании файла:', err);
        res.status(500).send({ message: 'Ошибка при скачивании файла' });
      }
    });
  } catch (err) {
    console.error('Ошибка при скачивании курса:', err);
    res.status(500).json({ message: 'Ошибка при скачивании курса' });
  }
});

// Получить список купленных материалов
router.get('/my', verifyToken, async (req, res) => {
  const ambassador_id = req.user.id;

  const result = await db.query(`
    SELECT p.*, cm.title, cm.description
    FROM Purchases p
    JOIN CourseMaterials cm ON p.course_material_id = cm.id
    WHERE p.ambassador_id = $1
  `, [ambassador_id]);

  res.json(result.rows);
});

// Для получения купленных курсов
router.get('/my-courses', verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await db.query(`
      SELECT cm.id, cm.title, cm.description, cm.price
      FROM CourseMaterials cm
      JOIN Purchases p ON cm.id = p.course_material_id
      WHERE p.ambassador_id = $1`, [userId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка при получении купленных курсов:', error);
    res.status(500).json({ message: 'Ошибка на сервере' });
  }
});


router.get('/created-by/:userId', verifyToken, async (req, res) => {
  const userId = req.params.userId;

  try {
    const result = await db.query(`
      SELECT id, title, description, price
      FROM CourseMaterials
      WHERE created_by = $1`, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Курсы не найдены для этого пользователя' });
    }
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка при получении созданных курсов:', error);
    res.status(500).json({ message: 'Ошибка на сервере' });
  }
});

router.get('/sales', verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await db.query(
      `SELECT COUNT(*) AS total_sales, SUM(cm.price) AS earnings
       FROM Purchases p
       JOIN CourseMaterials cm ON p.course_material_id = cm.id
       WHERE p.ambassador_id = $1`,
      [userId]
    );

    const stats = result.rows[0];
    res.json({
      totalSales: parseInt(stats.total_sales, 10),
      earnings: parseFloat(stats.earnings || 0),
    });
  } catch (err) {
    console.error('Ошибка при получении статистики:', err);
    res.status(500).json({ message: 'Ошибка при получении статистики' });
  }
});

router.delete('/:purchase_id', verifyToken, async (req, res) => {
  const { purchase_id } = req.params;
  const userId = req.user.id;

  try {
    const result = await db.query(
      'DELETE FROM Purchases WHERE id = $1 AND ambassador_id = $2 RETURNING *',
      [purchase_id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ message: 'Покупка не найдена или нет доступа' });
    }

    res.json({ message: 'Покупка удалена' });
  } catch (error) {
    console.error('Ошибка при удалении покупки:', error);
    res.status(500).json({ message: 'Ошибка на сервере' });
  }
});
module.exports = router;
