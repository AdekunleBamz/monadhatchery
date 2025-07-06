import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import User from './models/User.js';
import Monanimal from './models/Monanimal.js';
import fs from 'fs';
import { generateMonanimalSVG, svgToDataUrl } from './utils/monanimalSVG.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Debug: Check if .env file exists
const envPath = join(__dirname, '..', '.env');
console.log('Looking for .env file at:', envPath);
console.log('File exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  console.log('File contents:');
  console.log(fs.readFileSync(envPath, 'utf8'));
}

// Load environment variables from .env file
const result = dotenv.config({ path: envPath });
console.log('Dotenv result:', result);

console.log('Environment variables loaded:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('PORT:', process.env.PORT);

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not set');
  console.error('Current working directory:', process.cwd());
  process.exit(1);
}

// MongoDB connection (removed deprecated options)
mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('Connected to MongoDB Atlas');
  console.log('Database:', mongoose.connection.name);
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  console.error('Please check:');
  console.error('1. Your IP is whitelisted in MongoDB Atlas');
  console.error('2. Your connection string is correct');
  console.error('3. Your network connection is stable');
  process.exit(1);
});

// MonanimalNFT contract address and Monad testnet RPC
const MONANIMAL_NFT_ADDRESS = process.env.MONANIMAL_NFT_ADDRESS || "0x5e0F9e74f5Aa1CaD3EE7D4C734F7dDF0c816e456";
const MONAD_RPC_URL = process.env.MONAD_RPC_URL || "https://testnet-rpc.monad.xyz";

// API Routes

// Get user progress
app.get('/api/progress/:address', async (req, res) => {
  try {
    const { address } = req.params;
    let user = await User.findOne({ address: address.toLowerCase() });
    
    if (!user) {
      user = await User.create({ address: address.toLowerCase() });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user progress
app.post('/api/progress/update', async (req, res) => {
  try {
    const { address, points, progress } = req.body;
    const user = await User.findOneAndUpdate(
      { address: address.toLowerCase() },
      { points, progress },
      { new: true, upsert: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const users = await User.find()
      .sort({ points: -1 })
      .limit(10)
      .select('address points');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Monanimal metadata
app.get('/api/metadata/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const monanimal = await Monanimal.findOne({ tokenId: Number(tokenId) });
    
    if (!monanimal) {
      return res.status(404).json({ error: 'Monanimal not found' });
    }

    // Use the image from the DB, or a placeholder if not set
    const imageUrl = monanimal.image && monanimal.image.trim() !== ''
      ? monanimal.image
      : `https://placehold.co/400x400?text=Monanimal+${monanimal.tokenId}`;

    res.json({
      name: monanimal.name,
      description: monanimal.lore,
      image: imageUrl,
      attributes: [
        { trait_type: "Level", value: monanimal.level },
        { trait_type: "Type", value: monanimal.type },
        { trait_type: "Experience", value: monanimal.experience },
        // Add more traits as needed
      ]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record NFT mint
app.post('/api/monanimal/mint', async (req, res) => {
  try {
    const { tokenId, owner, traits, lore } = req.body;
    const name = `Monanimal #${tokenId}`;
    const level = 1;
    const type = 'Normal';

    // Auto-generate SVG and encode as data URL
    const svg = generateMonanimalSVG({ name, traits, level, type });
    const image = svgToDataUrl(svg);

    const monanimal = await Monanimal.create({
      tokenId,
      owner: owner.toLowerCase(),
      name,
      traits,
      lore,
      level,
      type,
      experience: 0,
      image,
    });

    await User.findOneAndUpdate(
      { address: owner.toLowerCase() },
      { $push: { monanimals: tokenId } },
      { new: true, upsert: true }
    );

    res.json(monanimal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record evolution
app.post('/api/monanimal/evolve', async (req, res) => {
  try {
    const { tokenId, traits, lore, evolutionStage } = req.body;
    const monanimal = await Monanimal.findOneAndUpdate(
      { tokenId },
      { traits, lore, evolutionStage },
      { new: true }
    );

    if (!monanimal) {
      return res.status(404).json({ error: 'Monanimal not found' });
    }

    res.json(monanimal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all Monanimals for a user
app.get('/api/users/:address/monanimals', async (req, res) => {
  try {
    const { address } = req.params;
    const monanimals = await Monanimal.find({ owner: address.toLowerCase() });
    res.json(monanimals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
