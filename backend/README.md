# Monad Hatchery Backend

This is the backend API server for the Monad Hatchery NFT game. It provides endpoints for managing user progress, Monanimal metadata, and leaderboard functionality.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/monad-hatchery
NODE_ENV=development
```

3. Make sure MongoDB is running locally or update the `MONGODB_URI` to point to your MongoDB instance.

## Development

Start the development server with hot reload:
```bash
npm run dev
```

## Production

Start the production server:
```bash
npm start
```

## API Endpoints

### User Progress
- `GET /api/progress/:address` - Get user progress
- `POST /api/progress/update` - Update user progress

### Leaderboard
- `GET /api/leaderboard` - Get top 10 players

### Monanimal Metadata
- `GET /api/metadata/:tokenId` - Get Monanimal metadata
- `POST /api/monanimal/mint` - Record NFT mint
- `POST /api/monanimal/evolve` - Record evolution

## Models

### User
- `address` (String) - Ethereum address
- `points` (Number) - Total points earned
- `progress` (Number) - Overall progress percentage
- `monanimals` (Array) - Array of owned Monanimal token IDs
- `loreCards` (Array) - Array of owned Lore Card token IDs

### Monanimal
- `tokenId` (Number) - NFT token ID
- `owner` (String) - Owner's Ethereum address
- `name` (String) - Monanimal name
- `traits` (String) - Comma-separated trait string
- `lore` (String) - Monanimal lore text
- `evolutionStage` (Number) - Current evolution stage 