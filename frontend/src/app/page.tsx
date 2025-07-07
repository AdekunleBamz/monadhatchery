'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import Image from 'next/image';
import { MonanimalCard } from '@/components/MonanimalCard';
import FusionInterface from '@/components/FusionInterface';
import { fetchUserMonanimals, MONANIMAL_NFT_ADDRESS, MONAD_CHAIN_ID, MONAD_RPC_URL } from '@/services/api';
import { WalletConnect } from '@/components/WalletConnect';
import { TraitSelector, types, abilities, getRandomElement } from '@/components/TraitSelector';
import { ChainValidator } from '@/components/ChainValidator';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { NetworkStatus } from '@/components/NetworkStatus';
import Link from 'next/link';
import { ethers } from 'ethers';
import MonanimalNFTAbi from '@/contracts/MonanimalNFT.abi.json';
import { FusionChamber } from '@/components/FusionChamber';
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

// Helper to prompt wallet to switch/add Monad Testnet
async function switchToMonadTestnet() {
  if (typeof window === 'undefined' || !window.ethereum) return;
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x279f' }], // 10143 in hex
    });
  } catch (switchError) {
    // This error code indicates the chain has not been added to MetaMask
    const err = switchError as any;
    if (
      err.code === 4902 ||
      (err.data && err.data.originalError && err.data.originalError.code === 4902)
    ) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x279f',
            chainName: 'Monad Testnet',
            nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
            rpcUrls: ['https://testnet-rpc.monad.xyz'],
            blockExplorerUrls: ['https://testnet.monadexplorer.com'],
          }],
        });
      } catch (addError) {
        const err = addError as any;
        alert('Failed to add Monad Testnet: ' + (err.message || String(err)));
      }
    } else {
      const err = switchError as any;
      alert('Failed to switch network: ' + (err.message || String(err)));
    }
  }
}

// Utility to generate real SVG for Monanimal NFT
function generateMonanimalSVG({ traits, tokenId, evolutionStage = 1 }: { traits: string; tokenId: number; evolutionStage?: number }) {
  const seed = `${tokenId}-${traits}`;
  let svg = createAvatar(bottts, { seed }).toString();
  // Add a badge for evolved stages
  if (evolutionStage === 2) {
    svg = svg.replace(
      '</svg>',
      `\n<g>\n<circle cx="200" cy="64" r="28" fill="#FFD700" stroke="#bfa100" stroke-width="4" />\n<text x="200" y="76" font-size="32" text-anchor="middle" alignment-baseline="middle">🦋</text>\n</g>\n</svg>`
    );
  } else if (evolutionStage === 3) {
    svg = svg.replace(
      '</svg>',
      `\n<g>\n<circle cx="200" cy="64" r="28" fill="#8000FF" stroke="#4B0082" stroke-width="4" />\n<text x="200" y="76" font-size="32" text-anchor="middle" alignment-baseline="middle">🦄</text>\n</g>\n</svg>`
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

export default function Home() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { writeContractAsync } = useWriteContract();
  const [userMonanimals, setUserMonanimals] = useState<Monanimal[]>([]);
  const [loading, setLoading] = useState(true);
  const [minting, setMinting] = useState(false);
  const [selectedColor, setSelectedColor] = useState('Red');
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLore, setShowLore] = useState(false);
  const [fusionTraits, setFusionTraits] = useState('');
  const [fusionResult, setFusionResult] = useState<string | null>(null);
  const [loreInput, setLoreInput] = useState('');
  const [loreList, setLoreList] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const loadUserData = async () => {
      if (isConnected && address) {
        try {
          const data = await fetchUserMonanimals(address);
          // Filter out any monanimals missing required properties
          setUserMonanimals(
            data.filter((m: any) => typeof m.tokenId === 'number' && typeof m.name === 'string' && typeof m.traits === 'string' && typeof m.image === 'string')
          );
        } catch (error) {
          const err = error as any;
          console.error('Error fetching user monanimals:', err);
        }
      }
      setLoading(false);
    };
    loadUserData();
  }, [address, isConnected, mounted]);

  const handleMint = async () => {
    if (!address) return;
    
    setMinting(true);
    setError(null);
    
    try {
      console.log('Starting mint process...');
      console.log('Selected color:', selectedColor);
      console.log('Contract address:', MONANIMAL_NFT_ADDRESS || '');
      console.log('Expected Chain ID:', MONAD_CHAIN_ID);
      console.log('Current Chain ID:', chainId);
      console.log('User address:', address);
      console.log('Contract ABI functions:', MonanimalNFTAbi.abi.filter((item: any) => item.type === 'function' && item.name === 'mint'));
      
      // Check if we're on the correct network
      if (chainId !== Number(MONAD_CHAIN_ID)) {
        throw new Error(`Wrong network. Expected chain ID: ${MONAD_CHAIN_ID}, but connected to: ${chainId}`);
      }

      // Check wallet balance (optional - you can implement this)
      // const balance = await getBalance({ address });
      // if (balance.value < parseEther('0.001')) {
      //   throw new Error('Insufficient balance for gas fees');
      // }
      
      // Use a simple tokenURI that points to off-chain metadata
      const nextTokenId = userMonanimals.length > 0 ? Math.max(...userMonanimals.map(m => m.tokenId || 0)) + 1 : 0;
      
      const selectedType = getRandomElement(types);
      const selectedAbility = getRandomElement(abilities);
      const traits = `color:${selectedColor},type:${selectedType},ability:${selectedAbility}`;
      
      // Use writeContractAsync directly with the hook
      const hash = await writeContractAsync({
        address: MONANIMAL_NFT_ADDRESS || '',
        abi: MonanimalNFTAbi.abi,
        functionName: 'mint',
        args: [
          traits, // initialTraits
          'A newly minted Monanimal', // initialLore
          `ipfs://QmMonanimal${nextTokenId}` // tokenURI, simple off-chain reference
        ],
        chainId: Number(MONAD_CHAIN_ID),
        gas: BigInt(1000000),
      });

      console.log('Transaction hash:', hash);
      // Wait for transaction receipt
      const provider = new ethers.providers.JsonRpcProvider(MONAD_RPC_URL);
      const receipt = await provider.waitForTransaction(hash);
      console.log('Transaction receipt logs:', receipt.logs);
      receipt.logs.forEach((log, idx) => {
        console.log(`Log[${idx}]: address=${log.address}, topics=`, log.topics, ', data=', log.data);
      });
      const iface = new ethers.utils.Interface(MonanimalNFTAbi.abi);
      let tokenId;
      // ERC-721 Transfer event signature
      const TRANSFER_EVENT_SIG = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
      for (const log of receipt.logs) {
        if (
          log.topics &&
          log.topics.length === 4 &&
          log.topics[0].toLowerCase() === TRANSFER_EVENT_SIG
        ) {
          // topics[3] is the tokenId (hex string)
          tokenId = parseInt(log.topics[3], 16);
          break;
        }
      }
      if (tokenId === undefined) {
        throw new Error('Could not determine tokenId from mint event');
      }
      console.log('New token ID from event:', tokenId);

      // Reload user Monanimals after successful mint
      const data = await fetchUserMonanimals(address);
      setUserMonanimals(data);
      
      alert('Monanimal minted successfully! 🎉');
      
    } catch (error: any) {
      console.error('Minting error:', error);
      
      let errorMessage = 'Minting failed. Please try again.';
      
      if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction. Please add more MON tokens to your wallet.';
      } else if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction was rejected by user.';
      } else if (error.message.includes('execution reverted')) {
        errorMessage = 'Transaction reverted. This might be due to insufficient funds, network issues, or contract problems.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('Wrong network')) {
        errorMessage = `Wrong network. Please connect to Monad testnet (Chain ID: ${MONAD_CHAIN_ID}). Current chain ID: ${chainId}`;
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Transaction timed out. Please try again or check your network connection.';
      } else {
        errorMessage = `Minting failed: ${error.message}`;
      }
      
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setMinting(false);
    }
  };

  // Enhanced lore submission mechanic
  const handleLoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loreInput.trim()) return;
    
    // Check if user has any Monanimals
    if (userMonanimals.length === 0) {
      alert('You need to own at least one Monanimal to submit lore!');
      return;
    }
    
    // Call the contract's submitLore function via wallet
    if (!window.ethereum) return alert('Wallet not found');
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(MONANIMAL_NFT_ADDRESS || '', MonanimalNFTAbi.abi, signer);
      
      // Use the first Monanimal's tokenId for community lore
      const tokenId = userMonanimals[0].tokenId;
      console.log('Submitting lore for tokenId:', tokenId);
      console.log('Lore content:', loreInput.trim());
      
      const tx = await contract.submitLore(tokenId, loreInput.trim());
      console.log('Lore submission transaction sent:', tx);
      
      // Wait for transaction confirmation
      await tx.wait();
      console.log('Lore submission confirmed');
      
      // Add to local lore list
      setLoreList([...loreList, loreInput.trim()]);
      setLoreInput('');
      
      alert('Lore submitted successfully! Your story is now part of the Monanimal universe! 📚✨');
      
    } catch (error) {
      const err = error as any;
      alert(`Failed to submit lore: ${err.message || String(err)}`);
    }
  };

  // Enhanced lore submission for specific NFTs
  const handleSpecificLoreSubmit = async (tokenId: number, lore: string) => {
    if (!lore.trim()) return;
    if (!window.ethereum) return alert('Wallet not found');
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(MONANIMAL_NFT_ADDRESS || '', MonanimalNFTAbi.abi, signer);
      
      console.log('Submitting specific lore for tokenId:', tokenId);
      console.log('Lore content:', lore.trim());
      
      const tx = await contract.submitLore(tokenId, lore.trim());
      console.log('Specific lore submission transaction sent:', tx);
      
      // Wait for transaction confirmation
      await tx.wait();
      console.log('Specific lore submission confirmed');
      
      alert(`Lore submitted successfully for Monanimal #${tokenId}! 📖✨`);
      
      // Refresh NFT data to show updated lore
      if (address) {
        const refreshedData = await fetchUserMonanimals(address);
        setUserMonanimals(refreshedData);
      }
      
    } catch (error) {
      const err = error as any;
      alert(`Failed to submit lore: ${err.message || String(err)}`);
    }
  };

  // Name submission for specific NFTs
  const handleNameSubmit = async (tokenId: number, customName: string) => {
    if (!customName.trim()) return;
    if (!window.ethereum) return alert('Wallet not found');
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(MONANIMAL_NFT_ADDRESS || '', MonanimalNFTAbi.abi, signer);
      
      console.log('Setting name for tokenId:', tokenId);
      console.log('Custom name:', customName.trim());
      
      const tx = await contract.setName(tokenId, customName.trim());
      console.log('Name setting transaction sent:', tx);
      
      // Wait for transaction confirmation
      await tx.wait();
      console.log('Name setting confirmed');
      
      alert(`Name set successfully for Monanimal #${tokenId}! 🏷️✨`);
      
      // Refresh NFT data to show updated name
      if (address) {
        const refreshedData = await fetchUserMonanimals(address);
        setUserMonanimals(refreshedData);
      }
      
    } catch (error) {
      const err = error as any;
      alert(`Failed to set name: ${err.message || String(err)}`);
    }
  };

  if (!mounted) {
    return null;
  }

  console.log('userMonanimals for FusionChamber:', userMonanimals);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        {/* Project Introduction Banner */}
        <div className="bg-blue-500 text-white text-center py-2 font-bold text-lg">
          Monad Hatchery: Create, Evolve, and Fuse Unique Monanimal NFTs on Monad Testnet
        </div>
        <nav className="bg-gray-800 p-4 shadow-lg border-2 border-yellow-400">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img src="/monad.svg" alt="Monad Logo" width={160} height={160} className="mr-2" />
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold">Monad Hatchery</h1>
                <NetworkStatus />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/leaderboard" className="bg-lime-600 hover:bg-lime-700 text-white font-bold py-2 px-4 rounded transition-colors shadow-md">Leaderboard</Link>
              <WalletConnect />
            </div>
          </div>
        </nav>
        <main className="container mx-auto px-4 py-8">
          {/* Show network switch prompt if on wrong network */}
          {isConnected && chainId !== Number(MONAD_CHAIN_ID) && (
            <div className="bg-red-700 text-white p-4 rounded mb-6 flex flex-col items-center">
              <p className="mb-2">You are connected to the wrong network. Please switch to Monad Testnet (Chain ID: {MONAD_CHAIN_ID}).</p>
              <button
                onClick={switchToMonadTestnet}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded"
              >
                Switch/Add Monad Testnet
              </button>
            </div>
          )}
          <div className="flex justify-end items-center mb-4">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              onClick={() => setShowLore(!showLore)}
            >
              {showLore ? 'Hide Lore' : 'Show Lore'}
            </button>
          </div>
          {showLore && (
            <div className="bg-gray-700 p-4 rounded mb-6">
              <h2 className="text-2xl font-bold mb-2">📚 Monad Lore Universe</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Community Lore Section */}
                <div className="bg-gray-800 p-4 rounded">
                  <h3 className="text-xl font-bold mb-3 text-green-400">🌍 Community Lore</h3>
                  <p className="text-sm text-gray-300 mb-4">
                    Contribute to the collective story of the Monanimal universe! Share legends, myths, and tales that will become part of blockchain history.
                  </p>
                  <form onSubmit={handleLoreSubmit} className="flex flex-col gap-2">
                    <textarea
                      placeholder="Write your Monanimal legend, myth, or story here... (e.g., 'The ancient Monanimals of Monad were said to possess the power to bridge worlds...')"
                      value={loreInput}
                      onChange={e => setLoreInput(e.target.value)}
                      className="font-bold text-lime-200 bg-gray-900 px-3 py-2 rounded h-24 resize-none placeholder-gray-500 focus:bg-gray-800 focus:text-white shadow-md"
                      maxLength={500}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">{loreInput.length}/500 characters</span>
                      <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
                        disabled={!loreInput.trim() || userMonanimals.length === 0}
                      >
                        {userMonanimals.length === 0 ? 'Need Monanimals' : 'Submit to Universe 📚'}
                      </button>
                    </div>
                  </form>
                  
                  {/* Display submitted lore */}
                  {loreList.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-bold mb-2 text-yellow-400">📖 Community Stories:</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {loreList.map((lore, idx) => (
                          <div key={idx} className="bg-gray-900 p-2 rounded text-sm">
                            <span className="text-purple-400">Story #{idx + 1}:</span> {lore}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Individual NFT Lore Section */}
                <div className="bg-gray-800 p-4 rounded">
                  <h3 className="text-xl font-bold mb-3 text-blue-400">🎭 Individual NFT Lore</h3>
                  <p className="text-sm text-gray-300 mb-4">
                    Each Monanimal can have its own unique story. Lore evolves with your NFTs and becomes part of their permanent identity on the blockchain.
                  </p>
                  
                  {userMonanimals.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="font-bold text-yellow-400">Your Monanimals' Stories:</h4>
                      {userMonanimals.slice(0, 3).map((monanimal, idx) => (
                        <div key={idx} className="bg-gray-900 p-3 rounded">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-blue-300">{monanimal.name}</span>
                            <span className="text-xs text-gray-400">#{monanimal.tokenId}</span>
                          </div>
                          {monanimal.lore ? (
                            <p className="text-sm text-gray-300 italic">"{monanimal.lore}"</p>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No lore yet...</p>
                          )}
                        </div>
                      ))}
                      {userMonanimals.length > 3 && (
                        <p className="text-xs text-gray-400 text-center">
                          ... and {userMonanimals.length - 3} more Monanimals
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-400">No Monanimals yet. Mint your first one to start creating stories!</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Lore Tips */}
              <div className="mt-4 p-3 bg-blue-900 rounded border border-blue-700">
                <h4 className="font-bold text-blue-300 mb-2">💡 Lore Tips:</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• <strong>Community Lore:</strong> Share legends that everyone can see and build upon</li>
                  <li>• <strong>Individual Lore:</strong> Each NFT's story evolves with it and becomes permanent</li>
                  <li>• <strong>Fusion Stories:</strong> Fused NFTs automatically get lore about their parentage</li>
                  <li>• <strong>Evolution Tales:</strong> Lore updates when your Monanimals evolve</li>
                </ul>
              </div>
            </div>
          )}
          {!isConnected ? (
            <div className="text-center py-16">
              <h2 className="text-4xl font-bold mb-8">Welcome to Monad Hatchery</h2>
              <p className="text-xl mb-8">Connect your wallet to start your journey!</p>
            </div>
          ) : (
            <>
              <ChainValidator />
              {loading ? (
                <LoadingSpinner message="Loading your Monanimals..." size="large" />
              ) : (
                <>
                  <h2 className="text-4xl font-bold mb-8">Your Monanimals</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userMonanimals.filter((monanimal: Monanimal) => typeof monanimal.tokenId === 'number').map((monanimal: Monanimal, index: number) => (
                      <MonanimalCard
                        key={`${monanimal.tokenId || 'unknown'}-${index}`}
                        name={monanimal.name}
                        level={monanimal.level}
                        type={monanimal.type}
                        experience={monanimal.experience}
                        traits={monanimal.traits}
                        lore={monanimal.lore}
                        image={monanimal.image}
                        evolutionStage={monanimal.evolutionStage}
                        tokenId={monanimal.tokenId as number}
                        onEvolve={async (updated) => {
                          // Refresh the specific NFT data from blockchain after evolution
                          if (address && updated.tokenId !== undefined) {
                            try {
                              const refreshedData = await fetchUserMonanimals(address);
                              setUserMonanimals(refreshedData);
                            } catch (error) {
                              const err = error as any;
                              console.error('Error refreshing NFT data after evolution:', err);
                              // Fallback: just reload the page
                              window.location.reload();
                            }
                          }
                        }}
                        onLoreSubmit={handleSpecificLoreSubmit}
                        onNameSubmit={handleNameSubmit}
                      />
                    ))}
                  </div>
                  <div className="text-center py-12">
                    <TraitSelector onChange={setSelectedColor} />
                    <div className="mb-2 text-sm font-semibold text-lime-300 drop-shadow">Minting fee: 0 $MON + gas fee</div>
                    {minting && (
                      <div className="mt-4 mb-4">
                        <LoadingSpinner message="Minting your Monanimal..." size="small" />
                        <p className="text-sm text-gray-400">Please confirm the transaction in your wallet</p>
                      </div>
                    )}
                    <button
                      onClick={handleMint}
                      disabled={minting}
                      className={`mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${minting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {minting ? 'Minting...' : 'Mint New Monanimal'}
                    </button>
                  </div>
                  <FusionChamber
                    monanimals={userMonanimals.filter(m => !isNaN(Number(m.tokenId)))}
                    owner={address || ''}
                    onFusionComplete={async (newMonanimal) => {
                      // Refresh all NFT data from blockchain after fusion
                      if (address) {
                        try {
                          const refreshedData = await fetchUserMonanimals(address);
                          setUserMonanimals(refreshedData);
                        } catch (error) {
                          const err = error as any;
                          console.error('Error refreshing NFT data after fusion:', err);
                          window.location.reload();
                        }
                      }
                    }}
                  />
                </>
              )}
            </>
          )}
        </main>
      </div>
      <footer className="w-full bg-gray-900 text-center py-6 mt-12 border-t border-gray-700">
        <div className="flex flex-col items-center gap-2">
          <span className="text-lg font-bold text-white">Built on Monad with <span className="text-red-400">♥</span> by BamzzStudio</span>
          <div className="flex gap-4 justify-center mt-2">
            <a href="https://github.com/AdekunleBamz" target="_blank" rel="noopener noreferrer" title="GitHub">
              <svg width="32" height="32" fill="white" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.262.82-.582 0-.288-.012-1.243-.017-2.252-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.606-2.665-.304-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.236-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23.96-.267 1.98-.399 3-.404 1.02.005 2.04.137 3 .404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.12 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.803 5.624-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.699.825.58C20.565 21.796 24 17.297 24 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
            <a href="mailto:bamzzstudio@gmail.com" title="Email">
              <svg width="32" height="32" fill="white" viewBox="0 0 24 24"><path d="M12 13.065L2.4 6.6V18h19.2V6.6l-9.6 6.465zm9.6-9.065H2.4A2.4 2.4 0 0 0 0 6.4v11.2A2.4 2.4 0 0 0 2.4 20h19.2a2.4 2.4 0 0 0 2.4-2.4V6.4A2.4 2.4 0 0 0 21.6 4zm-1.2 2.4v.511l-8.4 5.664-8.4-5.664V6.4h16.8z"/></svg>
            </a>
            <a href="https://adekunlebamz.github.io" target="_blank" rel="noopener noreferrer" title="Portfolio">
              <svg width="32" height="32" fill="white" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 2c1.657 0 3.156.672 4.242 1.758A6.978 6.978 0 0 0 12 6c-1.657 0-3.156.672-4.242 1.758A6.978 6.978 0 0 0 12 4zm0 16c-1.657 0-3.156-.672-4.242-1.758A6.978 6.978 0 0 0 12 18c1.657 0 3.156-.672 4.242-1.758A6.978 6.978 0 0 0 12 20zm8-8c0 1.657-.672 3.156-1.758 4.242A6.978 6.978 0 0 0 18 12c0-1.657.672-3.156 1.758-4.242A6.978 6.978 0 0 0 20 12zM4 12c0-1.657.672-3.156 1.758-4.242A6.978 6.978 0 0 0 6 12c0 1.657-.672 3.156-1.758 4.242A6.978 6.978 0 0 0 4 12zm2.343 5.657A8.963 8.963 0 0 1 4.062 12c.522-1.26 1.26-2.398 2.281-3.419A8.963 8.963 0 0 1 12 19.938a8.963 8.963 0 0 1-5.657-2.281zm11.314 0A8.963 8.963 0 0 1 12 19.938a8.963 8.963 0 0 1-5.657-2.281A8.963 8.963 0 0 1 12 4.062a8.963 8.963 0 0 1 5.657 2.281A8.963 8.963 0 0 1 19.938 12a8.963 8.963 0 0 1-2.281 5.657z"/></svg>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
