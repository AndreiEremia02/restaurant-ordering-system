const mongoose = require('mongoose');

const WaiterRequestSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: true
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: 'nepreluata'
  }
});

module.exports = mongoose.model('WaiterRequest', WaiterRequestSchema);
