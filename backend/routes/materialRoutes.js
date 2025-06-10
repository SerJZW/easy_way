const express = require('express');
const db = require('../db');
const multer = require('multer');
const verifyToken = require('../middleware/authMiddleware');
const allowRole = require('../middleware/allowRole');
const path = require('path');

const router = express.Router();

// Настроим multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'files/uploads');
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    cb(null, Date.now() + fileExtension);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const fileType = file.mimetype;
    if (fileType === 'application/pdf' || fileType.includes('msword') || fileType.includes('officedocument')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type, only PDF and Word documents are allowed'));
    }
  },
});

// Публичный список курсов
router.get('/', async (req, res) => {
  const result = await db.query(`
    SELECT cm.*, ct.name AS template_name, a.username AS author
    FROM CourseMaterials cm
    JOIN CourseTemplates ct ON cm.template_id = ct.id
    JOIN Accounts a ON cm.created_by = a.id
    WHERE cm.is_available = TRUE 
    ORDER BY cm.id DESC
  `);
  res.json(result.rows);
});

router.post('/', verifyToken, upload.single('file'), async (req, res) => {
  const { title, description, price, template_id, created_at } = req.body;
  const file = req.file;
  const userId = req.user.id;

  if (!file) {
    return res.status(400).json({ message: 'Файл не загружен' });
  }

  if (!template_id) {
    return res.status(400).json({ message: 'Пожалуйста, выберите шаблон' });
  }

  if (!created_at) {
    return res.status(400).json({ message: 'Дата создания не указана' });
  }

  try {
    const result = await db.query(`
      INSERT INTO CourseMaterials (title, description, price, file_url, template_id, created_at, created_by, is_available)
      VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE) RETURNING id
    `, [title, description, price, file.path, template_id, created_at, userId]);

    res.status(201).json({ material_id: result.rows[0].id });
  } catch (err) {
    console.error('Ошибка при загрузке материала:', err);
    res.status(500).json({ message: 'Ошибка на сервере' });
  }
});

router.get('/author', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT cm.*, a.username AS author_name
      FROM CourseMaterials cm
      JOIN Accounts a ON cm.created_by = a.id
      WHERE cm.is_available = TRUE  -- Можно добавить фильтрацию, если нужно только доступные курсы
      ORDER BY cm.id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка при получении материалов:', error);
    res.status(500).json({ message: 'Ошибка на сервере' });
  }
});
// Удалить курс по ID
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {

    const result = await db.query('SELECT * FROM CourseMaterials WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Курс не найден' });
    }

    await db.query('DELETE FROM CourseMaterials WHERE id = $1', [id]);

    res.json({ message: 'Курс успешно удалён' });
  } catch (err) {
    console.error('Ошибка при удалении курса:', err);
    res.status(500).json({ message: 'Ошибка при удалении курса' });
  }
});

module.exports = router;
