const db = require('../db');

// Функция для проверки имени роли
const allowRole = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const result = await db.query(
        'SELECT role_name FROM AccountRoles WHERE id = $1',
        [req.user.role_id]
      );

      const userRole = result.rows[0]?.role_name;

      if (!userRole || !allowedRoles.includes(userRole)) {
        return res.status(403).json({ message: 'Доступ запрещён: недостаточно прав' });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Ошибка проверки роли' });
    }
  };
};

module.exports = allowRole;
