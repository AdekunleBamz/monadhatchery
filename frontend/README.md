This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Monad Hatchery

Live App: [https://monadhatchery.vercel.app/](https://monadhatchery.vercel.app/)

Monad Hatchery is a web-based tool that enables users to mint, evolve, and fuse generative Monanimal NFTs on the Monad blockchain. The app provides a user-friendly interface for interacting with NFTs, features a dynamic leaderboard to showcase top community members, and includes additional engagement options like achievements, badges, and lore voting. Monad Hatchery makes it easy for anyone to explore, create, and participate in a gamified NFT ecosystem, blending creativity, competition, and community storytelling.

## Features
- **Mint Monanimal NFTs:** Create unique, generative SVG Monanimal NFTs on Monad Testnet.
- **Evolve & Fuse:** Evolve your Monanimals or fuse two to create a new one with inherited traits.
- **Lore System:** Add and vote on lore for your NFTs, contributing to the community-driven story.
- **Achievements & Badges:** Earn badges for minting, evolving, fusing, and lore submissions.
- **Leaderboard:** See top users ranked by NFTs owned, evolutions, fusions, and lore activity.
- **Wallet Integration:** Connect your wallet to interact with the Monad blockchain.
- **Modern UI:** Built with Next.js, Tailwind CSS, and responsive design for all devices.

## Getting Started (Local Development)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure
- `frontend/` — Next.js app (UI, wallet, leaderboard, etc.)
- `backend/` — Node.js/Express API (user/NFT data, aggregation, etc.)
- `contracts/` — Solidity smart contracts for Monanimal NFTs and game logic

## Security Notice
- **Do NOT commit secrets or credentials to the repository.**
- All sensitive data (MongoDB URI, private keys, etc.) must be stored in environment variables and .env files, which are gitignored by default.

## License
This project is open source and non-commercial, built for Monad Mission 5. All code and assets are for community and educational use.
