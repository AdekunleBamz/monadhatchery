import mongoose from 'mongoose';

const monanimalSchema = new mongoose.Schema({
  tokenId: {
    type: Number,
    required: true,
    unique: true,
  },
  owner: {
    type: String,
    required: true,
    lowercase: true,
  },
  name: {
    type: String,
    required: true,
  },
  traits: {
    type: String,
    required: true,
  },
  lore: {
    type: String,
    required: true,
  },
  evolutionStage: {
    type: Number,
    default: 1,
  },
  level: {
    type: Number,
    default: 1,
  },
  type: {
    type: String,
    default: 'Normal',
  },
  experience: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Monanimal', monanimalSchema); 