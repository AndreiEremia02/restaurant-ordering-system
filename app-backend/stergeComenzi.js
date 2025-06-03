const mongoose = require('mongoose');
const Comanda = require('./models/Order'); 
require('dotenv').config();

async function stergeToateComenzile() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const rezultat = await Comanda.deleteMany({});
    console.log(`Sterse ${rezultat.deletedCount} comenzi.`);
    mongoose.disconnect();
  } catch (err) {
    console.error('Eroare:', err);
  }
}

stergeToateComenzile();
