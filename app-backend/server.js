require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const STRINGS = require('./strings');

const { router: menuRouter } = require('./routes/menuRoutes');
const ordersRoutes = require('./routes/ordersRoutes');
const employeeRoutes = require('./routes/employeeRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = ['https://smashly.netlify.app', 'http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(STRINGS.CORS_NOT_ALLOWED));
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
  res.send(STRINGS.SERVER_RUNNING);
});

mongoose.connect(process.env.MONGO_URI, { dbName: 'smashlyBD' })
  .then(() => {
    console.log('Connected to MongoDB!');
    app.listen(PORT, () => {
      console.log(`${STRINGS.SERVER_RUNNING} on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(`${STRINGS.SERVER_ERROR}:`, err);
  });
