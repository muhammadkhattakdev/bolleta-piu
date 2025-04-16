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



const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://bolleta-piu-basm.vercel.app',
  'https://bolleta-piu.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    if(!origin) return callback(null, true);
    
    if(allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'PUT', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


const uploadsDir = path.join(__dirname, 'uploads');
const documentsDir = path.join(uploadsDir, 'documents');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir);
}

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/calculations', calculationRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

export default app;
