// backend/routes/competencyRoutes.js
const express = require('express');
const db = require('../db');
const verifyToken = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  const result = await db.query('SELECT * FROM Competencies ORDER BY id');
  res.json(result.rows);
});

module.exports = router;
