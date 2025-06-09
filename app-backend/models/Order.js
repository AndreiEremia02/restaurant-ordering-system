const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: true
  },
  products: [
    {
      id: String,
      name: String,
      price: Number
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: 'activa'
  },
  estimatedTime: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    default: null
  },
  tipAmount: {
    type: Number,
    default: 0
  },
  totalWithTip: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Order', OrderSchema);
