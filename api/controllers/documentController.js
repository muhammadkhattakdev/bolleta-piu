const Document = require('../models/Document');
const path = require('path');
const fs = require('fs');
const { extractDataFromPDF } = require('../utils/pdfParser');

// Upload document and extract data
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Extract data from PDF
    const pdfPath = req.file.path;
    const extractedData = await extractDataFromPDF(pdfPath);
    
    // Create new document record
    const document = new Document({
      user: req.user.id,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      filePath: pdfPath,
      extractedData
    });
    
    await document.save();
    
    res.status(201).json({
      success: true,
      document: {
        id: document._id,
        fileName: document.fileName,
        originalName: document.originalName,
        extractedData: document.extractedData
      }
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all documents for the user
exports.getUserDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ user: req.user.id }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: documents.length,
      documents: documents.map(doc => ({
        id: doc._id,
        fileName: doc.fileName,
        originalName: doc.originalName,
        createdAt: doc.createdAt,
        extractedData: doc.extractedData
      }))
    });
  } catch (error) {
    console.error('Error getting documents:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single document
exports.getDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check document belongs to user
    if (document.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this document' });
    }
    
    res.status(200).json({
      success: true,
      document: {
        id: document._id,
        fileName: document.fileName,
        originalName: document.originalName,
        fileSize: document.fileSize,
        createdAt: document.createdAt,
        extractedData: document.extractedData
      }
    });
  } catch (error) {
    console.error('Error getting document:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Download document
exports.downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check document belongs to user
    if (document.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this document' });
    }
    
    const filePath = document.filePath;
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }
    
    res.download(filePath, document.originalName);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check document belongs to user
    if (document.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this document' });
    }
    
    // Delete file from server
    const filePath = document.filePath;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Delete document from database
    await document.remove();
    
    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};