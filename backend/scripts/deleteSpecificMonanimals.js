import mongoose from 'mongoose';
import Monanimal from '../src/models/Monanimal.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Connect to MongoDB
await mongoose.connect(process.env.MONGODB_URI);

// List of tokenIds to delete
const tokenIdsToDelete = [15, 16, 17, 18, 19, 20];

const result = await Monanimal.deleteMany({ tokenId: { $in: tokenIdsToDelete } });
console.log(`Deleted ${result.deletedCount} Monanimals with tokenIds: ${tokenIdsToDelete.join(', ')}`);

process.exit(0); 