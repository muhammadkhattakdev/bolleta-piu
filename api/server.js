import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/auth.js';
import documentRoutes from './routes/document.js';
import calculationRoutes from './routes/calculation.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));


// app.use(express.static(path.join(__dirname, "/client/dist")))

// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "/client/dist/index.html"))
// })




const uploadsDir = path.join(__dirname, 'uploads');
const documentsDir = path.join(uploadsDir, 'documents');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir);
}

// 
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/calculations', calculationRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });