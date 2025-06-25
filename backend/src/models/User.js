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
}, {
  timestamps: true,
});

export default mongoose.model('User', userSchema); 