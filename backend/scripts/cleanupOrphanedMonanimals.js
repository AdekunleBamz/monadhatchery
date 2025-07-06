import mongoose from 'mongoose';
import Monanimal from '../src/models/Monanimal.js';
import { JsonRpcProvider, Contract } from 'ethers';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Connect to MongoDB
await mongoose.connect(process.env.MONGODB_URI);

// Connect to your NFT contract
const provider = new JsonRpcProvider(process.env.MONAD_RPC_URL);
const contractAddress = process.env.MONANIMAL_NFT_ADDRESS;
const abi = [
  "function ownerOf(uint256 tokenId) view returns (address)"
];
const contract = new Contract(contractAddress, abi, provider);

// Find all Monanimals in DB
const allMonanimals = await Monanimal.find({});
let deleted = 0;

for (const monanimal of allMonanimals) {
  try {
    await contract.ownerOf(monanimal.tokenId);
    // If no error, token exists on-chain
  } catch (e) {
    if (
      (e.reason && e.reason.includes('Nonexistent token')) ||
      (e.shortMessage && e.shortMessage.includes('Nonexistent token'))
    ) {
      // Token does not exist on-chain, delete from DB
      await Monanimal.deleteOne({ tokenId: monanimal.tokenId });
      deleted++;
      console.log(`Deleted orphaned Monanimal with tokenId ${monanimal.tokenId}`);
    }
  }
}

console.log(`Cleanup complete. Deleted ${deleted} orphaned Monanimals.`);
process.exit(0); 