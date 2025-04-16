const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  extractedData: {
    offerName: String,
    offerCode: String,
    priceFormula: String,
    fixedFees: {
      monthlyFee: Number,
      contributionFee: Number
    },
    variableFees: {
      programmationFee: Number,
      variableCommission: Number
    },
    punRates: {
      F0: Number,
      F1: Number,
      F2: Number,
      F3: Number,
      F23: Number
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Document', DocumentSchema);