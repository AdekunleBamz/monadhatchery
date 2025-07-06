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
import path from 'path';

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

// Helper to get all animal image filenames
function getAnimalImages() {
  const dir = path.join(__dirname, '../../frontend/public/monanimals');
  return fs.readdirSync(dir).filter(f => f.endsWith('.png') || f.endsWith('.svg'));
}

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

    // If image is missing, regenerate and save it
    let image = monanimal.image;
    if (!image || image.trim() === '') {
      const svg = generateMonanimalSVG({ traits: monanimal.traits, tokenId: monanimal.tokenId });
      image = svgToDataUrl(svg);
      monanimal.image = image;
      await monanimal.save();
    }

    res.json({
      name: monanimal.name,
      description: monanimal.lore,
      image,
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
    const { tokenId, owner, traits: incomingTraits, lore } = req.body;
    const name = `Monanimal #${tokenId}`;
    const level = 1;
    const type = 'Normal';

    function randomTrait(traitType, options) {
      return `${traitType}:${options[Math.floor(Math.random() * options.length)]}`;
    }

    const traitOptions = {
      color: ['Red', 'Blue', 'Green', 'Yellow', 'Purple'],
      type: ['Fire', 'Water', 'Earth', 'Mystic', 'Air'],
      ability: ['Swift', 'Strong', 'Clever', 'Brave', 'Stealthy'],
    };

    let traits = incomingTraits;
    if (!traits) {
      traits = [
        randomTrait('color', traitOptions.color),
        randomTrait('type', traitOptions.type),
        randomTrait('ability', traitOptions.ability),
      ].join(',');
    }

    // Generate SVG and encode as data URL
    const svg = generateMonanimalSVG({ traits, tokenId });
    const image = svgToDataUrl(svg);

    // Only create if it doesn't exist
    const existing = await Monanimal.findOne({ tokenId });
    if (existing) {
      return res.status(400).json({ error: 'Token already exists' });
    }

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

// Get a random Monanimal
app.get('/api/monanimals/random', async (req, res) => {
  try {
    const count = await Monanimal.countDocuments();
    const random = Math.floor(Math.random() * count);
    const monanimal = await Monanimal.findOne().skip(random);
    if (!monanimal) {
      return res.status(404).json({ error: 'No Monanimals found' });
    }
    res.json(monanimal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fusion endpoint: User selects traits to inherit
app.post('/api/monanimal/fuse', async (req, res) => {
  try {
    const { parentAId, parentBId, owner, selectedTraits } = req.body;
    const parentA = await Monanimal.findOne({ tokenId: Number(parentAId) });
    const parentB = await Monanimal.findOne({ tokenId: Number(parentBId) });

    if (!parentA || !parentB) {
      return res.status(404).json({ error: 'One or both parent Monanimals not found' });
    }

    // selectedTraits is an object, e.g. { color: "Red", type: "Fire", ability: "Swift" }
    const fusedTraits = Object.entries(selectedTraits)
      .map(([key, value]) => `${key}:${value}`)
      .join(',');

    const newTokenId = (await Monanimal.find().sort({ tokenId: -1 }).limit(1))[0]?.tokenId + 1 || 1;
    const name = `Monanimal #${newTokenId}`;
    const level = 1;
    const type = 'Normal';
    const lore = `Fused from #${parentAId} and #${parentBId}`;

    // Generate SVG and encode as data URL
    const svg = generateMonanimalSVG({ traits: fusedTraits, tokenId: newTokenId });
    const image = svgToDataUrl(svg);

    const fusedMonanimal = await Monanimal.create({
      tokenId: newTokenId,
      owner: owner.toLowerCase(),
      name,
      traits: fusedTraits,
      lore,
      level,
      type,
      experience: 0,
      image,
    });

    await User.findOneAndUpdate(
      { address: owner.toLowerCase() },
      { $push: { monanimals: newTokenId } },
      { new: true, upsert: true }
    );

    res.json(fusedMonanimal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Preview endpoint for fusion (returns SVG image for selected traits)
app.post('/api/monanimal/preview', async (req, res) => {
  try {
    const { selectedTraits, tokenId } = req.body;
    const traits = Object.entries(selectedTraits)
      .map(([key, value]) => `${key}:${value}`)
      .join(',');
    const svg = generateMonanimalSVG({ traits, tokenId });
    const image = svgToDataUrl(svg);
    res.json({ image });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
