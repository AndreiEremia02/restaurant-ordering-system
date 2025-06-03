const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const WaiterRequest = require('../models/WaiterRequest');

const menuData = require('./menuRoutes').menuDataFlat;

router.post('/order', async (req, res) => {
  const { tableNumber, products, totalAmount, notes } = req.body;

  if (!tableNumber || !products || products.length === 0) {
    return res.status(400).json({ mesaj: 'Comanda incompleta.' });
  }

  const estimatedTime = products.reduce((sum, product) => {
    const menuItem = menuData.find(item => item.id === product.id);
    const time = menuItem?.time || 5;
    return sum + time;
  }, 0) + 5;

  try {
    const newOrder = new Order({
      tableNumber,
      products,
      totalAmount,
      notes: Array.isArray(notes) ? notes.join('; ') : notes,
      estimatedTime
    });

    await newOrder.save();

    res.status(201).json({ mesaj: 'Comanda inregistrata cu succes.', order: newOrder });
  } catch (err) {
    console.error('Eroare la salvarea comenzii:', err);
    res.status(500).json({ mesaj: 'Eroare la salvarea comenzii.' });
  }
});

router.get('/orders/:tableId', async (req, res) => {
  const tableId = parseInt(req.params.tableId);

  if (isNaN(tableId)) {
    return res.status(400).json({ mesaj: 'ID-ul mesei este invalid.' });
  }

  try {
    const activeOrders = await Order.find({
      tableNumber: tableId,
      status: { $ne: 'platita' }
    });

    return res.status(200).json({ tableNumber: tableId, orders: activeOrders });
  } catch (err) {
    console.error('Eroare la citirea comenzilor:', err);
    res.status(500).json({ mesaj: 'Eroare la citirea comenzilor.' });
  }
});

router.put('/order/:id', async (req, res) => {
  const { id } = req.params;
  const { newStatus } = req.body;

  if (!newStatus) {
    return res.status(400).json({ mesaj: 'Statusul nou este necesar.' });
  }

  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ mesaj: 'Comanda nu a fost gasita.' });

    order.status = newStatus;
    await order.save();

    res.json({
      mesaj: 'Status actualizat cu succes.',
      secondsReduced: order.estimatedTime * 60,
      isLast: await Order.countDocuments({
        tableNumber: order.tableNumber,
        status: { $nin: ['platita', 'livrata'] }
      }) === 0
    });
  } catch (err) {
    console.error('Eroare la actualizarea comenzii:', err);
    res.status(500).json({ mesaj: 'Eroare la actualizarea comenzii.' });
  }
});

router.post('/call-waiter', async (req, res) => {
  const { tableNumber } = req.body;

  if (!tableNumber) {
    return res.status(400).json({ mesaj: 'Numarul mesei este necesar.' });
  }

  try {
    const existingRequest = await WaiterRequest.findOne({ tableNumber, status: 'nepreluata' });

    if (existingRequest) {
      const elapsed = Date.now() - new Date(existingRequest.requestedAt).getTime();
      const twoMinutes = 2 * 60 * 1000;

      if (elapsed < twoMinutes) {
        return res.status(400).json({ mesaj: 'Exista deja o cerere activa pentru aceasta masa.' });
      }

      await WaiterRequest.findByIdAndDelete(existingRequest._id);
    }

    const newRequest = new WaiterRequest({ tableNumber });
    await newRequest.save();

    res.status(201).json({ mesaj: 'Ospatarul a fost chemat.', request: newRequest });
  } catch (err) {
    console.error('Eroare la chemarea ospatarului:', err);
    res.status(500).json({ mesaj: 'Eroare la chemarea ospatarului.' });
  }
});

router.post('/pay', async (req, res) => {
  const { orderId, paymentMethod, tipPercentage } = req.body;

  if (!orderId || !paymentMethod) {
    return res.status(400).json({ mesaj: 'Date de plata incomplete.' });
  }

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ mesaj: 'Comanda nu a fost gasita.' });
    }

    if (order.status === 'platita') {
      return res.status(400).json({ mesaj: 'Comanda este deja platita.' });
    }

    const tip = tipPercentage ? Math.round((tipPercentage / 100) * order.totalAmount) : 0;
    const totalWithTip = order.totalAmount + tip;

    await Order.findByIdAndDelete(orderId);

    res.json({ mesaj: 'Comanda a fost platita si stearsa.' });
  } catch (err) {
    console.error('Eroare la plata:', err);
    res.status(500).json({ mesaj: 'Eroare la procesarea platii.' });
  }
});

router.post('/pay-table', async (req, res) => {
  const { tableNumber, paymentMethod, tipPercentage } = req.body;

  if (!tableNumber || !paymentMethod) {
    return res.status(400).json({ mesaj: 'Date de plata incomplete.' });
  }

  try {
    const unpaidOrders = await Order.find({ tableNumber, status: { $ne: 'platita' } });

    if (!unpaidOrders.length) {
      return res.status(404).json({ mesaj: 'Nu exista comenzi de plata pentru aceasta masa.' });
    }

    const total = unpaidOrders.reduce((acc, o) => acc + o.totalAmount, 0);
    const tip = tipPercentage ? Math.round((tipPercentage / 100) * total) : 0;
    const totalWithTip = total + tip;

    for (const order of unpaidOrders) {
      order.status = 'platita';
      order.paymentMethod = paymentMethod;
      order.tip = tip;
      order.totalWithTip = totalWithTip;
      await order.save();
    }

    res.json({ mesaj: 'Toate comenzile au fost platite cu succes.', total, tip });
  } catch (err) {
    console.error('Eroare la procesarea platii:', err);
    res.status(500).json({ mesaj: 'Eroare la procesarea platii.' });
  }
});

module.exports = router;
