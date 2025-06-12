const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const WaiterRequest = require('../models/WaiterRequest');
const menuData = require('./menuRoutes').menuDataFlat;
const mongoose = require('mongoose');

const calculatePreparationTime = (products) => {
  let totalTime = 0;

  for (let item of products) {
    const found = menuData.find(p => p.id === item.id);
    if (found && found.time) {
      totalTime += found.time;
    }
  }

  if (totalTime === 0) {
    totalTime = 10;
  }

  return totalTime;
};

router.post('/order', async (req, res) => {
  const { tableNumber, products, totalAmount, notes } = req.body;
  if (!tableNumber || !products || products.length === 0) {
    return res.status(400).json({ mesaj: 'Comanda incompleta.' });
  }

  const estimatedTime = calculatePreparationTime(products);

  try {
    const newOrder = new Order({
      tableNumber,
      products,
      totalAmount,
      notes: Array.isArray(notes) ? notes.join('; ') : notes,
      estimatedTime,
      status: 'activa'
    });

    await newOrder.save();
    res.status(201).json({ mesaj: 'Comanda inregistrata cu succes.', order: newOrder });
  } catch (err) {
    res.status(500).json({ mesaj: 'Eroare la salvarea comenzii.' });
  }
});

router.get('/orders/:tableId', async (req, res) => {
  const tableId = parseInt(req.params.tableId);
  if (isNaN(tableId)) {
    return res.status(400).json({ mesaj: 'ID-ul mesei este invalid.' });
  }

  try {
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
    const activeOrders = await Order.find({
      tableNumber: tableId,
      status: 'activa',
      createdAt: { $gte: todayStart }
    });
    res.status(200).json({ tableNumber: tableId, orders: activeOrders });
  } catch (err) {
    res.status(500).json({ mesaj: 'Eroare la citirea comenzilor.' });
  }
});

router.delete('/orders/cleanup', async (req, res) => {
  try {
    const result = await Order.deleteMany({
      createdAt: { $lt: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    res.json({ mesaj: 'Comenzi vechi sterse.', sterse: result.deletedCount });
  } catch (err) {
    res.status(500).json({ mesaj: 'Eroare la stergerea comenzilor vechi.' });
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

    const restante = await Order.countDocuments({
      tableNumber: order.tableNumber,
      status: { $nin: ['platita', 'livrata'] }
    });

    const message = restante === 0 ? 'Comanda este pe drum' : null;

    res.json({
      mesaj: 'Status actualizat cu succes.',
      secondsReduced: order.estimatedTime * 60,
      isLast: restante === 0,
      popupMessage: message,
      tableNumber: order.tableNumber
    });

  } catch (err) {
    res.status(500).json({ mesaj: 'Eroare la actualizarea comenzii.' });
  }
});

router.delete('/order/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ mesaj: 'ID comanda invalid.' });
  }

  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ mesaj: 'Comanda nu a fost gasita.' });

    await Order.findByIdAndDelete(id);
    res.json({ mesaj: 'Comanda a fost stearsa cu succes.' });
  } catch (err) {
    res.status(500).json({ mesaj: 'Eroare la stergerea comenzii.' });
  }
});

router.post('/call-waiter', async (req, res) => {
  const { tableNumber } = req.body;
  if (!tableNumber) {
    return res.status(400).json({ mesaj: 'Numarul mesei este necesar.' });
  }

  try {
    const existingRequest = await WaiterRequest.findOne({ tableNumber, status: 'buzz' });
    if (existingRequest) {
      const elapsed = Date.now() - new Date(existingRequest.requestedAt).getTime();
      if (elapsed < 2 * 60 * 1000) {
        return res.status(400).json({ mesaj: 'Exista deja o cerere activa pentru aceasta masa.' });
      }
      await WaiterRequest.findByIdAndDelete(existingRequest._id);
    }

    const newRequest = new WaiterRequest({ tableNumber, status: 'buzz' });
    await newRequest.save();

    res.status(201).json({ mesaj: 'Ospatarul a fost chemat.', request: newRequest });
  } catch (err) {
    res.status(500).json({ mesaj: 'Eroare la chemarea ospatarului.' });
  }
});

router.post('/pay', async (req, res) => {
  const { orderId, paymentMethod } = req.body;
  if (!orderId || !paymentMethod) {
    return res.status(400).json({ mesaj: 'Date de plata incomplete.' });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ mesaj: 'Comanda nu a fost gasita.' });

    if (order.status === 'platita') {
      return res.status(400).json({ mesaj: 'Comanda este deja platita.' });
    }

    await Order.findByIdAndDelete(orderId);
    res.json({ mesaj: 'Comanda a fost platita si stearsa.' });
  } catch (err) {
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

    for (const order of unpaidOrders) {
      await Order.findByIdAndDelete(order._id);
    }

    res.json({ mesaj: 'Toate comenzile au fost platite si sterse.', total, tip });
  } catch (err) {
    res.status(500).json({ mesaj: 'Eroare la procesarea platii.' });
  }
});

router.get('/buzz-status', async (req, res) => {
  try {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const activeRequests = await WaiterRequest.find({
      status: 'buzz',
      requestedAt: { $gte: twoMinutesAgo }
    });

    const tableNumbers = activeRequests.map(req => req.tableNumber);
    res.json({ tables: tableNumbers });
  } catch (err) {
    res.status(500).json({ mesaj: 'Eroare la verificarea cererilor BUZZ.' });
  }
});

module.exports = router;
