const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const {
  uploadDocument,
  getUserDocuments,
  getDocument,
  downloadDocument,
  deleteDocument
} = require('../controllers/documentController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${req.user.id}-${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

router.post('/upload', protect, upload.single('document'), uploadDocument);

router.get('/', protect, getUserDocuments);

router.get('/:id', protect, getDocument);

router.get('/:id/download', protect, downloadDocument);

router.delete('/:id', protect, deleteDocument);

module.exports = router;