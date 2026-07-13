require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

// Connect DB
connectDB();

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`MC Adarkwah API running on port ${PORT}`);
  console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
});
