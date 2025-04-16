const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createCalculation,
  getUserCalculations,
  getCalculation,
  deleteCalculation,
  exportCalculationPDF
} = require('../controllers/calculationController');

router.post('/', protect, createCalculation);

router.get('/', protect, getUserCalculations);

router.get('/:id', protect, getCalculation);

router.delete('/:id', protect, deleteCalculation);

router.get('/:id/export-pdf', protect, exportCalculationPDF);

module.exports = router;