const mongoose = require('mongoose');

const CalculationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  consumption: {
    electricityF0: Number,
    electricityF1: Number,
    electricityF2: Number,
    electricityF3: Number,
    gas: Number
  },
  results: {
    monthlyCosts: {
      electricityByBand: {
        F0: Number,
        F1: Number,
        F2: Number,
        F3: Number
      },
      fixedCosts: Number,
      totalElectricity: Number,
      gas: Number,
      total: Number
    },
    annualCosts: {
      electricity: Number,
      gas: Number,
      total: Number
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Calculation', CalculationSchema);