import { ethers } from 'ethers';
import MonanimalNFTAbi from '@/contracts/MonanimalNFT.abi.json';
import { createAvatar } from '@dicebear/core';
import { bottts } from '@dicebear/collection';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://monadhatchery-backend.onrender.com/api'
    : 'http://localhost:4001/api');

// Updated Monad testnet configuration with correct details
export const MONAD_CHAIN_ID = process.env.NEXT_PUBLIC_MONAD_CHAIN_ID || 10143;

// Always use the Monad testnet RPC URL directly for provider
const MONAD_RPC_URL_HARDCODED = 'https://testnet-rpc.monad.xyz';

export const MONANIMAL_NFT_ADDRESS = '0x625F483C831181FDaa660d1B5C8DF3Fb0F880B72';

export const MONAD_RPC_URL = MONAD_RPC_URL_HARDCODED;

// Evolution configuration
const EVOLUTION_CONFIG = {
  stages: [
    { level: 1, type: 'Baby', experience: 0, badge: null },
    { level: 5, type: 'Adolescent', experience: 100, badge: '🦋' },
    { level: 10, type: 'Adult', experience: 500, badge: '🦄' }
  ]
};

// Utility to calculate evolution stats based on evolution count
function calculateEvolutionStats(evolutionCount = 0) {
  const stage = EVOLUTION_CONFIG.stages[Math.min(evolutionCount, EVOLUTION_CONFIG.stages.length - 1)];
  return {
    level: stage.level,
    type: stage.type,
    experience: stage.experience,
    evolutionStage: evolutionCount,
    badge: stage.badge
  };
}

// Utility to generate real SVG for Monanimal NFT
function generateMonanimalSVG({ traits, tokenId, evolutionStage = 0 }: { traits: string; tokenId: number; evolutionStage?: number }) {
  const seed = `${tokenId}-${traits}`;
  let svg = createAvatar(bottts, { seed }).toString();
  
  // Add evolution badges based on stage
  const stats = calculateEvolutionStats(evolutionStage);
  if (stats.badge) {
    const badgeColor = evolutionStage === 1 ? '#FFD700' : '#8000FF';
    const strokeColor = evolutionStage === 1 ? '#bfa100' : '#4B0082';
    svg = svg.replace(
      '</svg>',
      `\n<g>\n<circle cx="200" cy="64" r="28" fill="${badgeColor}" stroke="${strokeColor}" stroke-width="4" />\n<text x="200" y="76" font-size="32" text-anchor="middle" alignment-baseline="middle">${stats.badge}</text>\n</g>\n</svg>`
    );
  }
  
  return svg;
}

function svgToDataUrl(svg: string) {
  if (typeof window !== 'undefined') {
    return `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(svg)))}`;
  } else {
    return '';
  }
}

export async function fetchUserMonanimals(address: string) {
  if (!address) return [];
  const provider = new ethers.providers.JsonRpcProvider(MONAD_RPC_URL_HARDCODED);
  const contract = new ethers.Contract(MONANIMAL_NFT_ADDRESS, MonanimalNFTAbi.abi, provider);
  let monanimals = [];
  let nextTokenId = 0;
  try {
    nextTokenId = await contract.nextTokenId();
  } catch (e) {
    // fallback if nextTokenId is not public
    nextTokenId = 1000; // arbitrary upper bound for testnet
  }
  for (let tokenId = 0; tokenId < nextTokenId; tokenId++) {
    try {
      const owner = await contract.ownerOf(tokenId);
      if (owner.toLowerCase() === address.toLowerCase()) {
        const tokenURI = await contract.tokenURI(tokenId);
        // Read actual traits, lore, and names from contract
        const traits = await contract.traits(tokenId);
        const lore = await contract.lore(tokenId);
        const name = await contract.names(tokenId);
        
        // Calculate evolution stage based on traits and lore content
        let evolutionStage = 0;
        
        // Check for max evolution first (highest priority)
        if (traits.includes('(Max Evolved)') || lore.includes('(Max Evolved)')) {
          evolutionStage = 2;
        }
        // Check for regular evolution
        else if (traits.includes('(Evolved)') || lore.includes('(Evolved)')) {
          evolutionStage = 1;
        }
        // Check for fused NFTs - they start at evolution stage 1
        else if (lore.includes('Fused from')) {
          evolutionStage = 1;
        }
        
        // Debug logging for evolution stage detection
        console.log(`Token ${tokenId} - Traits: "${traits}", Lore: "${lore}", Evolution Stage: ${evolutionStage}`);
        
        // Calculate stats based on evolution stage
        const stats = calculateEvolutionStats(evolutionStage);
        
        let image = '';
        
        // Handle data URLs (embedded metadata)
        if (tokenURI.startsWith('data:application/json;base64,')) {
          try {
            const base64Data = tokenURI.replace('data:application/json;base64,', '');
            const jsonString = decodeURIComponent(escape(window.atob(base64Data)));
            const metadata = JSON.parse(jsonString);
            image = metadata.image || '';
            // Use metadata fields if available
            const monanimal = {
              _id: tokenId.toString(),
              name: name || metadata.name || `Monanimal #${tokenId}`, // Use contract name first
              level: stats.level,
              type: stats.type,
              experience: stats.experience,
              traits: metadata.traits || traits, // Use contract traits as fallback
              lore: metadata.description || lore, // Use contract lore as fallback
              tokenId,
              image,
              evolutionStage: stats.evolutionStage,
            };
            monanimals.push(monanimal);
            continue; // Skip the HTTP/IPFS handling below
          } catch (e) {
            console.error('Error parsing data URL metadata:', e);
          }
        }
        
        // Handle placeholder tokenURIs, invalid URLs, or any non-data URLs by generating SVG on-the-fly
        if (tokenURI.startsWith('ipfs://QmMonanimal') || 
            tokenURI.includes('placeholder') || 
            tokenURI.includes('example.com') ||
            tokenURI.startsWith('http') ||
            tokenURI.startsWith('ipfs://')) {
          // Generate real SVG image for this token using actual traits and evolution stage
          const svg = generateMonanimalSVG({ traits, tokenId, evolutionStage: stats.evolutionStage });
          image = svgToDataUrl(svg);
        }
        
        monanimals.push({
          _id: tokenId.toString(),
          name: name || `Monanimal #${tokenId}`, // Use contract name first
          level: stats.level,
          type: stats.type,
          experience: stats.experience,
          traits, // Use actual traits from contract
          lore, // Use actual lore from contract
          tokenId,
          image,
          evolutionStage: stats.evolutionStage,
        });
      }
    } catch (e) {
      // token does not exist or is burned
      continue;
    }
  }
  return monanimals;
}

export const mintMonanimal = async (address: string) => {
  // Generate dummy data for now
  const payload = {
    tokenId: Math.floor(Math.random() * 1000000), // unique ID for demo
    owner: address,
    traits: 'default:default', // placeholder traits
    lore: 'A newly minted Monanimal', // placeholder lore
  };

  const response = await fetch(`${API_BASE_URL}/monanimal/mint`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error('Failed to mint monanimal');
  }
  return response.json();
};
