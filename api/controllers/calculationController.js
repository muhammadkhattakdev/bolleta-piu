const Calculation = require('../models/Calculation');
const Document = require('../models/Document');

// Create new calculation
exports.createCalculation = async (req, res) => {
  try {
    const { documentId, consumption } = req.body;
    
    // Validate required fields
    if (!documentId || !consumption) {
      return res.status(400).json({ message: 'Document ID and consumption data are required' });
    }
    
    // Find document
    const document = await Document.findById(documentId);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check document belongs to user
    if (document.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to use this document' });
    }
    
    // Calculate costs
    const results = calculateUtilityCosts(consumption, document.extractedData);
    
    // Create calculation record
    const calculation = new Calculation({
      user: req.user.id,
      document: documentId,
      consumption,
      results
    });
    
    await calculation.save();
    
    res.status(201).json({
      success: true,
      calculationId: calculation._id,
      results
    });
  } catch (error) {
    console.error('Error creating calculation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all calculations for the user
exports.getUserCalculations = async (req, res) => {
  try {
    const calculations = await Calculation.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('document', 'originalName extractedData.offerName');
    
    res.status(200).json({
      success: true,
      count: calculations.length,
      calculations: calculations.map(calc => ({
        id: calc._id,
        documentName: calc.document.originalName,
        offerName: calc.document.extractedData.offerName,
        monthlyCost: calc.results.monthlyCosts.total,
        annualCost: calc.results.annualCosts.total,
        createdAt: calc.createdAt
      }))
    });
  } catch (error) {
    console.error('Error getting calculations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single calculation
exports.getCalculation = async (req, res) => {
  try {
    const calculation = await Calculation.findById(req.params.id)
      .populate('document', 'originalName extractedData');
    
    if (!calculation) {
      return res.status(404).json({ message: 'Calculation not found' });
    }
    
    // Check calculation belongs to user
    if (calculation.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this calculation' });
    }
    
    res.status(200).json({
      success: true,
      calculation: {
        id: calculation._id,
        document: {
          id: calculation.document._id,
          name: calculation.document.originalName,
          extractedData: calculation.document.extractedData
        },
        consumption: calculation.consumption,
        results: calculation.results,
        createdAt: calculation.createdAt
      }
    });
  } catch (error) {
    console.error('Error getting calculation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete calculation
exports.deleteCalculation = async (req, res) => {
    try {
      const calculation = await Calculation.findById(req.params.id);
      
      if (!calculation) {
        return res.status(404).json({ message: 'Calculation not found' });
      }
      
      if (calculation.user.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to delete this calculation' });
      }
      
      await Calculation.deleteOne({ _id: calculation._id });
      
      res.status(200).json({
        success: true,
        message: 'Calculation deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting calculation:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

exports.exportCalculationPDF = async (req, res) => {
    try {
      const calculation = await Calculation.findById(req.params.id)
        .populate('document', 'originalName extractedData user');
      
      if (!calculation) {
        return res.status(404).json({ message: 'Calculation not found' });
      }
      
      // Check calculation belongs to user
      if (calculation.user.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to access this calculation' });
      }
  
      // Generate PDF using PDFKit
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument();
      
      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=calculation-${calculation._id}.pdf`);
      
      // Pipe the PDF to the response
      doc.pipe(res);
      
      // Add content to PDF
      doc.fontSize(20).text('Bolletta Più - Calculation Results', { align: 'center' });
      doc.moveDown();
      
      // Document information
      doc.fontSize(14).text('Document Information');
      doc.moveDown(0.5);
      doc.fontSize(12).text(`Offer: ${calculation.document.extractedData.offerName}`);
      doc.text(`Offer Code: ${calculation.document.extractedData.offerCode}`);
      doc.text(`Price Formula: ${calculation.document.extractedData.priceFormula}`);
      doc.moveDown();
      
      // Consumption data
      doc.fontSize(14).text('Consumption Data');
      doc.moveDown(0.5);
      if (calculation.consumption.electricityF0) {
        doc.text(`F0 (All hours): ${calculation.consumption.electricityF0} kWh`);
      }
      if (calculation.consumption.electricityF1) {
        doc.text(`F1 (Peak hours): ${calculation.consumption.electricityF1} kWh`);
      }
      if (calculation.consumption.electricityF2) {
        doc.text(`F2 (Mid-peak hours): ${calculation.consumption.electricityF2} kWh`);
      }
      if (calculation.consumption.electricityF3) {
        doc.text(`F3 (Off-peak hours): ${calculation.consumption.electricityF3} kWh`);
      }
      if (calculation.consumption.gas) {
        doc.text(`Gas: ${calculation.consumption.gas} m³`);
      }
      doc.moveDown();
      
      // Monthly costs
      doc.fontSize(14).text('Monthly Costs');
      doc.moveDown(0.5);
      const monthlyCosts = calculation.results.monthlyCosts;
      doc.text(`F0 Cost: €${monthlyCosts.electricityByBand.F0}`);
      doc.text(`F1 Cost: €${monthlyCosts.electricityByBand.F1}`);
      doc.text(`F2 Cost: €${monthlyCosts.electricityByBand.F2}`);
      doc.text(`F3 Cost: €${monthlyCosts.electricityByBand.F3}`);
      doc.text(`Fixed Costs: €${monthlyCosts.fixedCosts}`);
      doc.text(`Total Electricity: €${monthlyCosts.totalElectricity}`);
      if (parseFloat(monthlyCosts.gas) > 0) {
        doc.text(`Total Gas: €${monthlyCosts.gas}`);
      }
      doc.fontSize(14).text(`Total Monthly Cost: €${monthlyCosts.total}`, { underline: true });
      doc.moveDown();
      
      // Annual costs
      doc.fontSize(14).text('Annual Costs');
      doc.moveDown(0.5);
      const annualCosts = calculation.results.annualCosts;
      doc.text(`Electricity: €${annualCosts.electricity}`);
      if (parseFloat(annualCosts.gas) > 0) {
        doc.text(`Gas: €${annualCosts.gas}`);
      }
      doc.fontSize(14).text(`Total Annual Cost: €${annualCosts.total}`, { underline: true });
      doc.moveDown();
      
      // Notes
      doc.fontSize(12).text('Notes:');
      doc.fontSize(10).text('• Calculations based on the Energy Smart Casa 2025 contract terms.');
      doc.text('• All costs include VAT and applicable taxes.');
      doc.text('• Actual costs may vary based on real consumption patterns.');
      
      // Add date and footer
      doc.moveDown(2);
      doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' });
      doc.text('Bolletta Più - Utility Bill Calculator', { align: 'center' });
      
      // Finalize PDF
      doc.end();
      
    } catch (error) {
      console.error('Error exporting calculation as PDF:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

// Utility function to calculate costs
function calculateUtilityCosts(consumption, extractedData) {
  // Calculate electricity costs
  const calculateElectricityCost = (consumption, rate) => {
    const energyCost = consumption * (rate + 0.05); // PUN + 0.05 €/kWh
    const programmationFee = consumption * extractedData.variableFees.programmationFee;
    const variableCommission = consumption * extractedData.variableFees.variableCommission;
    return energyCost + programmationFee + variableCommission;
  };
  
  // Calculate for each time band
  const electricityCostF0 = parseFloat(consumption.electricityF0) 
    ? calculateElectricityCost(parseFloat(consumption.electricityF0), extractedData.punRates.F0)
    : 0;
    
  const electricityCostF1 = parseFloat(consumption.electricityF1)
    ? calculateElectricityCost(parseFloat(consumption.electricityF1), extractedData.punRates.F1)
    : 0;
    
  const electricityCostF2 = parseFloat(consumption.electricityF2)
    ? calculateElectricityCost(parseFloat(consumption.electricityF2), extractedData.punRates.F2)
    : 0;
    
  const electricityCostF3 = parseFloat(consumption.electricityF3)
    ? calculateElectricityCost(parseFloat(consumption.electricityF3), extractedData.punRates.F3)
    : 0;
  
  // Calculate monthly fixed costs
  const monthlyFixedCosts = extractedData.fixedFees.monthlyFee + extractedData.fixedFees.contributionFee;
  
  // Calculate total electricity costs
  const totalElectricityCost = electricityCostF0 + electricityCostF1 + electricityCostF2 + electricityCostF3 + monthlyFixedCosts;
  
  // Calculate gas costs (simplified for demonstration)
  const gasCost = parseFloat(consumption.gas) || 0;
  
  // Calculate annual costs
  const annualElectricityCost = totalElectricityCost * 12;

  // Return results
  return {
    monthlyCosts: {
      electricityByBand: {
        F0: parseFloat(electricityCostF0.toFixed(2)),
        F1: parseFloat(electricityCostF1.toFixed(2)),
        F2: parseFloat(electricityCostF2.toFixed(2)),
        F3: parseFloat(electricityCostF3.toFixed(2))
      },
      fixedCosts: parseFloat(monthlyFixedCosts.toFixed(2)),
      totalElectricity: parseFloat(totalElectricityCost.toFixed(2)),
      gas: parseFloat(gasCost.toFixed(2)),
      total: parseFloat((totalElectricityCost + gasCost).toFixed(2))
    },
    annualCosts: {
      electricity: parseFloat(annualElectricityCost.toFixed(2)),
      gas: parseFloat((gasCost * 12).toFixed(2)),
      total: parseFloat(((annualElectricityCost) + (gasCost * 12)).toFixed(2))
    }
  };
}