import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  points: {
    type: Number,
    default: 0,
  },
  progress: {
    type: Number,
    default: 0,
  },
  monanimals: [{
    type: Number,
  }],
  loreCards: [{
    type: Number,
  }],
  achievements: {
    type: Object,
    default: {
      minted: 0,
      evolved: 0,
      fused: 0,
      lore: 0,
      badges: []
    }
  },
}, {
  timestamps: true,
});

export default mongoose.model('User', userSchema); 