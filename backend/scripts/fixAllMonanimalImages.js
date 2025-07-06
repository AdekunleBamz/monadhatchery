import mongoose from 'mongoose';
import Monanimal from '../src/models/Monanimal.js';
import { generateMonanimalSVG, svgToDataUrl } from '../src/utils/monanimalSVG.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Connect to MongoDB
await mongoose.connect(process.env.MONGODB_URI);

const allMonanimals = await Monanimal.find({});
let updated = 0;

for (const monanimal of allMonanimals) {
  const svg = generateMonanimalSVG({ traits: monanimal.traits, tokenId: monanimal.tokenId });
  monanimal.image = svgToDataUrl(svg);
  await monanimal.save();
  updated++;
  console.log(`(Re)generated image for Monanimal #${monanimal.tokenId}`);
}

console.log(`(Re)generated images for ${updated} Monanimals.`);
process.exit(0); 