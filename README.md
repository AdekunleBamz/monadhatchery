# Monad Hatchery

Monad Hatchery is a novel NFT project for the Monad Mission 5 competition. It combines a dynamic NFT collection (Monanimal Evolution NFTs) with a gamified dashboard and trait visualizer tool.

## Features
- **Monanimal Evolution NFTs:** Mint baby Monanimals that evolve based on wallet/testnet activity.
- **Trait Changes:** Traits update via smart contract logic tied to user achievements.
- **Lore Cards:** Unlock animated lore cards as you progress.
- **Forge Your Monanimal:** Manually select traits for a burn fee.
- **NFT Fusion:** Combine two Monanimals to create a rare one.
- **Lore Leaderboard:** Ranks users by NFT interaction and lore progress.
- **Progress Visualizer:** Dashboard to track evolution, traits, and lore milestones.

## Tech Stack
- Solidity (or Monad-compatible language) for smart contracts
- Node.js/Express backend
- React.js frontend
- Web3.js/Ethers.js for blockchain interaction
- IPFS/Pinata for NFT storage
- MongoDB/PostgreSQL for leaderboard and progress tracking

## Open Source
All code and assets are open source for the competition.

## Getting Started (Frontend)

This project uses [Next.js](https://nextjs.org), bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

First, run the development server:

```bash
npm run dev --workspace frontend
# or
yarn dev --workspace frontend
# or
pnpm dev --workspace frontend
# or
bun dev --workspace frontend
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `frontend/src/app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
