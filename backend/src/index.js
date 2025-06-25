import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import User from './models/User.js';
import Monanimal from './models/Monanimal.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://bamzzstudio:keZYWZ24TnXllSCM@datapulse1.ne9hfar.mongodb.net/monad-hatchery?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

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

    res.json(monanimal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record NFT mint
app.post('/api/monanimal/mint', async (req, res) => {
  try {
    const { tokenId, owner, traits, lore } = req.body;
    const name = `Monanimal #${tokenId}`;

    const monanimal = await Monanimal.create({
      tokenId,
      owner: owner.toLowerCase(),
      name,
      traits,
      lore,
      level: 1,
      type: 'Normal',
      experience: 0,
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
