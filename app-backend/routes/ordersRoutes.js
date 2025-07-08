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
  const estimatedTime = calculatePreparationTime(products);
  try {
    const newOrder = new Order({
      tableNumber,
      products,
      totalAmount,
      notes: Array.isArray(notes) ? notes.join('; ') : notes,
      estimatedTime,
      status: 'activa',
      isPaid: false,
      isDeletedByEmployee: false
    });

    await newOrder.save();
    res.status(201).json({ mesaj: 'Comanda inregistrata cu succes.', order: newOrder });
  } catch (err) {
    res.status(500).json({ mesaj: 'Eroare la salvarea comenzii.' });
  }
});

router.get('/orders/:tableId', async (req, res) => {
  const tableId = req.params.tableId;
  const forClient = req.query.forClient === 'true';
  if (!tableId) {
    return res.status(400).json({ mesaj: 'ID-ul mesei este invalid.' });
  }
  try {
    if (forClient) {
      const orders = await Order.find({
        tableNumber: tableId,
        status: { $in: ['activa', 'livrat'] },
        isPaid: false
      });
      return res.status(200).json({ tableNumber: tableId, orders });
    } else {
      const activeOrders = await Order.find({
        tableNumber: tableId,
        status: { $in: ['activa', 'livrat'] },
        isPaid: false,
        isDeletedByEmployee: false
      });
      return res.status(200).json({ tableNumber: tableId, orders: activeOrders });
    }
  } catch (err) {
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

    const restante = await Order.countDocuments({
      tableNumber: order.tableNumber,
      status: 'activa',
      isPaid: false,
      isDeletedByEmployee: false
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

router.put('/order/:id/hide', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ mesaj: 'ID comanda invalid.' });
  }
  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ mesaj: 'Comanda nu a fost gasita.' });
    }
    order.isDeletedByEmployee = true;
    await order.save();
    res.json({ mesaj: 'Comanda a fost ascunsa din dashboard.' });
  } catch (err) {
    res.status(500).json({ mesaj: 'Eroare la ascunderea comenzii.' });
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
  const { orderId, paymentMethod, tipPercentage } = req.body;
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Comanda nu a fost gasita' });
    }
    order.paymentMethod = paymentMethod;
    order.tipAmount = Math.round((tipPercentage / 100) * order.totalAmount);
    order.totalWithTip = order.totalAmount + order.tipAmount;
    order.status = 'platita';
    order.isPaid = true;
    await order.save();
    res.status(200).json({ message: 'Plata procesata' });
  } catch (error) {
    res.status(500).json({ message: 'Eroare la plata' });
  }
});

router.post('/pay-table', async (req, res) => {
  const { tableNumber, paymentMethod, tipPercentage } = req.body;
  try {
    const unpaidOrders = await Order.find({
      tableNumber,
      status: { $ne: 'platita' },
      isPaid: false,
      isDeletedByEmployee: false
    });
    if (!unpaidOrders.length) {
      return res.status(404).json({ mesaj: 'Nu exista comenzi de plata pentru aceasta masa.' });
    }
    const total = unpaidOrders.reduce((acc, o) => acc + o.totalAmount, 0);
    const tip = tipPercentage ? Math.round((tipPercentage / 100) * total) : 0;
    for (const order of unpaidOrders) {
      order.isPaid = true;
      order.status = 'platita';
      order.paymentMethod = paymentMethod;
      order.tipAmount = Math.round(tip / unpaidOrders.length);
      order.totalWithTip = order.totalAmount + order.tipAmount;
      await order.save();
    }
    res.json({ mesaj: 'Toate comenzile au fost platite.', total, tip });
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

router.get('/stats', async (req, res) => {
  try {
    const allPaid = await Order.find({ isPaid: true });
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const hourlyTotals = {};
    for (let h = 10; h <= 22; h++) {
      hourlyTotals[h] = 0;
    }
    const dailyTotals = {};
    const monthlyTotals = {};
    const productCounts = {};
    for (const order of allPaid) {
      const date = new Date(order.createdAt);
      const hour = date.getHours();
      const dayKey = date.toISOString().slice(0, 10);
      const monthKey = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
      if (hour >= 10 && hour <= 22 && date >= startOfToday) {
        hourlyTotals[hour] += order.totalWithTip || order.totalAmount;
      }
      dailyTotals[dayKey] = (dailyTotals[dayKey] || 0) + (order.totalWithTip || order.totalAmount);
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + (order.totalWithTip || order.totalAmount);
      for (const item of order.products) {
        productCounts[item.name] = (productCounts[item.name] || 0) + 1;
      }
    }
    const topProducts = Object.entries(productCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    res.json({
      hourlyTotals,
      dailyTotals,
      monthlyTotals,
      topProducts
    });
  } catch (err) {
    res.status(500).json({ mesaj: 'Eroare la generarea statisticilor.' });
  }
});

module.exports = router;
