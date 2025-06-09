require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const cron = require('node-cron');

const { router: menuRouter } = require('./routes/menuRoutes');
const ordersRoutes = require('./routes/ordersRoutes');
const employeeRoutes = require('./routes/employeeRoutes');

const Order = require('./models/Order');

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = ['https://smashly.netlify.app', 'http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS nu permite!'));
    }
  },
  credentials: true
}));

app.use(express.json());

app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/api', menuRouter);
app.use('/api', ordersRoutes);
app.use('/api/employees', employeeRoutes);

app.get('/', (req, res) => {
  res.send('Serverul functioneaza!');
});

const cleanupOldOrders = async () => {
  try {
    const cutoff = new Date(new Date().setHours(0, 0, 0, 0));
    const result = await Order.deleteMany({
      createdAt: { $lt: cutoff }
    });
    console.log(`Cleanup: ${result.deletedCount} comenzi vechi sterse.`);
  } catch (err) {
    console.error('Eroare la cleanup:', err);
  }
};

cron.schedule('1 0 * * *', () => {
  console.log('Rulez cleanup zilnic...');
  cleanupOldOrders();
});

mongoose.connect(process.env.MONGO_URI, { dbName: 'smashlyBD' })
  .then(() => {
    console.log('Conectat la MongoDB Atlas');
    cleanupOldOrders();
  })
  .catch(err => console.error('Eroare conectare:', err));

app.listen(PORT, () => {
  console.log(`Serverul ruleaza pe http://localhost:${PORT}`);
});
