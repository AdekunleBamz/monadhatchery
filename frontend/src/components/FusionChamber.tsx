import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { MONANIMAL_NFT_ADDRESS } from '@/services/api';
import MonanimalNFTAbi from '@/contracts/MonanimalNFT.abi.json';
import { createAvatar } from '@dicebear/core';
import { bottts } from '@dicebear/collection';

interface Monanimal {
  tokenId: number;
  name: string;
  level: number;
  type: string;
  experience: number;
  traits: string;
  lore?: string;
  image: string;
  evolutionStage?: number;
}

interface FusionChamberProps {
  monanimals: Monanimal[];
  owner: string;
  onFusionComplete: (newMonanimal: Monanimal) => void;
}

function parseTraits(traits: string) {
  return Object.fromEntries(traits.split(',').map(t => t.split(':')));
}

// Evolution configuration (same as in api.ts)
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

// Utility to generate SVG for fusion preview
function generateFusionPreviewSVG(selectedTraits: { [key: string]: string }, tokenId: number = 0) {
  const traitsString = Object.entries(selectedTraits)
    .map(([key, value]) => `${key}:${value}`)
    .join(',');
  const seed = `fusion-${tokenId}-${traitsString}`;
  let svg = createAvatar(bottts, { seed }).toString();
  
  // Add evolution badge for fused Monanimals (they start at evolution stage 1)
  const stats = calculateEvolutionStats(1);
  if (stats.badge) {
    svg = svg.replace(
      '</svg>',
      `\n<g>\n<circle cx="200" cy="64" r="28" fill="#FFD700" stroke="#bfa100" stroke-width="4" />\n<text x="200" y="76" font-size="32" text-anchor="middle" alignment-baseline="middle">${stats.badge}</text>\n</g>\n</svg>`
    );
  }
  
  return `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(svg)))}`;
}

export const FusionChamber: React.FC<FusionChamberProps> = ({ monanimals, owner, onFusionComplete }) => {
  const [parentA, setParentA] = useState<Monanimal | null>(null);
  const [parentB, setParentB] = useState<Monanimal | null>(null);
  const [selectedTraits, setSelectedTraits] = useState<{ [key: string]: string }>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shouldPreview, setShouldPreview] = useState(false);

  const traitKeys = parentA && parentB
    ? Array.from(new Set([...Object.keys(parseTraits(parentA.traits)), ...Object.keys(parseTraits(parentB.traits))]))
    : [];

  const handleTraitSelect = (trait: string, value: string) => {
    setSelectedTraits(prev => ({ ...prev, [trait]: value }));
  };

  const handlePreview = async () => {
    if (!parentA || !parentB) return;
    setLoading(true);
    try {
      // Generate preview locally instead of calling backend
      const previewSvg = generateFusionPreviewSVG(selectedTraits, 0);
      setPreviewImage(previewSvg);
      setShouldPreview(true);
    } catch (error) {
      const err = error as any;
      console.error('Error generating preview:', err);
      setPreviewImage(null);
      setShouldPreview(false);
    }
    setLoading(false);
  };

  const handleFuse = async () => {
    if (!parentA || !parentB) return alert('Select two Monanimals to fuse.');
    if (parentA.tokenId === parentB.tokenId) return alert('Cannot fuse the same Monanimal.');
    
    setLoading(true);
    try {
      // Build fusedTraits from selectedTraits
      const fusedTraits = Object.entries(selectedTraits)
        .map(([key, value]) => `${key}:${value}`)
        .join(',');
      // Build fusedLore (for demo, just join parent names)
      const fusedLore = `Fused from #${parentA.tokenId} and #${parentB.tokenId}`;
      if (!fusedTraits || !fusedLore) return alert('Traits and lore must be set.');
      if (!window.ethereum) return alert('Wallet not found');
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(MONANIMAL_NFT_ADDRESS, MonanimalNFTAbi.abi, signer);
      
      console.log('Starting fusion process...');
      console.log('Parent A tokenId:', parentA.tokenId);
      console.log('Parent B tokenId:', parentB.tokenId);
      console.log('Fused traits:', fusedTraits);
      console.log('Fused lore:', fusedLore);
      
      const tx = await contract.fuse(parentA.tokenId, parentB.tokenId, fusedTraits, fusedLore, 'ipfs://placeholder');
      console.log('Fusion transaction sent:', tx);
      
      // Wait for transaction receipt and extract the new tokenId
      const receipt = await tx.wait();
      console.log('Fusion transaction confirmed');
      console.log('Transaction receipt logs:', receipt.logs);
      
      // Extract the new tokenId from the Transfer event
      let newTokenId;
      const TRANSFER_EVENT_SIG = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
      for (const log of receipt.logs) {
        if (
          log.topics &&
          log.topics.length === 4 &&
          log.topics[0].toLowerCase() === TRANSFER_EVENT_SIG
        ) {
          // topics[3] is the tokenId (hex string)
          newTokenId = parseInt(log.topics[3], 16);
          break;
        }
      }
      
      if (newTokenId === undefined) {
        console.warn('Could not determine new tokenId from fusion event, using fallback');
        newTokenId = 0; // fallback
      }
      
      console.log('New fused token ID:', newTokenId);
      alert(`Fusion completed successfully! New Monanimal #${newTokenId} created! 🎉`);
      
      // Call the callback to update the UI
      if (onFusionComplete) {
        // Calculate stats for fused NFT (starts at evolution stage 1)
        const fusedStats = calculateEvolutionStats(1);
        const newMonanimal = {
          tokenId: newTokenId, // Use the actual tokenId from the blockchain
          name: `Fused Monanimal #${newTokenId}`,
          level: fusedStats.level,
          type: fusedStats.type,
          experience: fusedStats.experience,
          traits: fusedTraits,
          lore: fusedLore,
          image: previewImage || '',
          evolutionStage: fusedStats.evolutionStage,
        };
        onFusionComplete(newMonanimal);
      }
      
      // Reset the form
      setParentA(null);
      setParentB(null);
      setSelectedTraits({});
      setPreviewImage(null);
      setShouldPreview(false);
      
    } catch (error) {
      const err = error as any;
      console.error('Fusion error:', err);
      alert(`Fusion failed: ${err.message || String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Fusion Chamber</h2>
      <div className="flex gap-4 mb-4">
        <div>
          <h3 className="font-semibold">Parent A</h3>
          <select 
            className="bg-white text-black px-2 py-1 rounded"
            onChange={e => setParentA(monanimals.find(m => m.tokenId === Number(e.target.value)) || null)}>
            <option value="">Select</option>
            {monanimals.map((m, index) => (
              <option key={`${m.tokenId || 'unknown'}-${index}`} value={m.tokenId}>{m.name}</option>
            ))}
          </select>
          {parentA && <img src={parentA.image} alt={parentA.name} className="w-32 h-32 mt-2" />}
        </div>
        <div>
          <h3 className="font-semibold">Parent B</h3>
          <select 
            className="bg-white text-black px-2 py-1 rounded"
            onChange={e => setParentB(monanimals.find(m => m.tokenId === Number(e.target.value)) || null)}>
            <option value="">Select</option>
            {monanimals.map((m, index) => (
              <option key={`${m.tokenId || 'unknown'}-${index}`} value={m.tokenId}>{m.name}</option>
            ))}
          </select>
          {parentB && <img src={parentB.image} alt={parentB.name} className="w-32 h-32 mt-2" />}
        </div>
      </div>
      {parentA && parentB && (
        <div>
          <h3 className="font-semibold mb-2">Select Traits to Inherit</h3>
          {traitKeys.map(trait => (
            <div key={trait} className="mb-2">
              <span className="mr-2">{trait}:</span>
              <button
                className={`mr-2 px-2 py-1 rounded ${selectedTraits[trait] === parseTraits(parentA.traits)[trait] ? 'bg-blue-500 text-white' : 'bg-gray-700'}`}
                onClick={() => handleTraitSelect(trait, parseTraits(parentA.traits)[trait])}
              >
                {parseTraits(parentA.traits)[trait]}
              </button>
              <button
                className={`px-2 py-1 rounded ${selectedTraits[trait] === parseTraits(parentB.traits)[trait] ? 'bg-blue-500 text-white' : 'bg-gray-700'}`}
                onClick={() => handleTraitSelect(trait, parseTraits(parentB.traits)[trait])}
              >
                {parseTraits(parentB.traits)[trait]}
              </button>
            </div>
          ))}
          <button
            className="mt-2 px-4 py-2 bg-yellow-500 text-black rounded"
            disabled={Object.keys(selectedTraits).length !== traitKeys.length || loading}
            onClick={handlePreview}
          >
            Preview
          </button>
        </div>
      )}
      {loading && <div>Loading preview...</div>}
      {shouldPreview && previewImage && (
        <div className="mt-4">
          <h3 className="font-semibold">Fusion Preview</h3>
          <img src={previewImage} alt="Fusion Preview" className="w-40 h-40 mx-auto" />
        </div>
      )}
      {parentA && parentB && Object.keys(selectedTraits).length === traitKeys.length && (
        <div className="mt-4 p-3 bg-orange-900 border border-orange-500 rounded-lg">
          <div className="flex items-center">
            <span className="text-orange-300 mr-2">⚠️</span>
            <span className="text-orange-200 text-sm">
              <strong>Warning:</strong> Fusion will burn your original NFTs (#{parentA.tokenId} and #{parentB.tokenId}) to create a new fused Monanimal. This action cannot be undone.
            </span>
          </div>
        </div>
      )}
      <button
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
        disabled={!parentA || !parentB || Object.keys(selectedTraits).length !== traitKeys.length || loading}
        onClick={handleFuse}
      >
        {loading ? 'Fusing...' : 'Fuse!'}
      </button>
    </div>
  );
}; 