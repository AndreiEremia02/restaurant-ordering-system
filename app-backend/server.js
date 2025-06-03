require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const menuRoutes = require('./routes/menuRoutes');
const ordersRoutes = require('./routes/ordersRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/images', express.static(path.join(__dirname, 'public/images')));

app.use('/api', menuRoutes);
app.use('/api', ordersRoutes);

app.get('/', (req, res) => {
  res.send('Serverul functioneaza!');
});

mongoose.connect(process.env.MONGO_URI, { dbName: 'smashlyBD' })
  .then(() => console.log('Conectat la MongoDB Atlas'))
  .catch(err => console.error('Eroare conectare:', err));

app.listen(PORT, () => {
  console.log(`Serverul ruleaza pe http://localhost:${PORT}`);
});
