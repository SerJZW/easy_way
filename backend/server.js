const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;


// Middleware
app.use(cors());
app.use(express.json());

// Подключение маршрутов
app.use('/auth', require('./routes/authRoutes'));
app.use('/accounts', require('./routes/accountRoutes'));
app.use('/materials', require('./routes/materialRoutes'));
app.use('/purchases', require('./routes/purchaseRoutes'));
app.use('/templates', require('./routes/templateRoutes'));
app.use('/methodologies', require('./routes/methodologyRoutes'));
app.use('/competencies', require('./routes/competencyRoutes')); 
// Запуск сервера
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
});
