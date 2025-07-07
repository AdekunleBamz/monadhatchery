import React, { useState } from 'react';
import { ethers } from 'ethers';
import { MONANIMAL_NFT_ADDRESS } from '@/services/api';
import MonanimalNFTAbi from '@/contracts/MonanimalNFT.abi.json';

interface MonanimalCardProps {
  name: string;
  level: number;
  type: string;
  experience: number;
  traits?: string;
  lore?: string;
  image?: string;
  tokenId?: number;
  evolutionStage?: number;
  onEvolve?: (updated: any) => void;
  onLoreSubmit?: (tokenId: number, lore: string) => void;
  onNameSubmit?: (tokenId: number, name: string) => void;
}

export const MonanimalCard: React.FC<MonanimalCardProps> = ({ name, level, type, experience, traits, lore, image, tokenId, evolutionStage, onEvolve, onLoreSubmit, onNameSubmit }) => {
  const [showNameInput, setShowNameInput] = useState(false);
  const [showLoreInput, setShowLoreInput] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [loreInput, setLoreInput] = useState('');
  
  // Determine if max evolution is reached
  const isMaxEvolved = (evolutionStage ?? 0) >= 2;
  const canEvolve = (evolutionStage ?? 0) < 2;
  
  // Get evolution stage info
  const getEvolutionInfo = () => {
    switch (evolutionStage ?? 0) {
      case 0:
        return { stage: 'Baby', nextStage: 'Adolescent', badge: null };
      case 1:
        return { stage: 'Adolescent', nextStage: 'Adult', badge: '🦋' };
      case 2:
        return { stage: 'Adult', nextStage: null, badge: '🦄' };
      default:
        return { stage: 'Unknown', nextStage: null, badge: null };
    }
  };
  
  const evolutionInfo = getEvolutionInfo();

  const handleNameSave = () => {
    if (nameInput.trim() && onNameSubmit && tokenId !== undefined) {
      onNameSubmit(tokenId, nameInput.trim());
      setNameInput('');
      setShowNameInput(false);
    }
  };

  const handleLoreSave = () => {
    if (loreInput.trim() && onLoreSubmit && tokenId !== undefined) {
      onLoreSubmit(tokenId, loreInput.trim());
      setLoreInput('');
      setShowLoreInput(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg flex flex-col gap-2">
      {image && (
        <div className="relative">
          <img src={image} alt={name} className="w-full h-48 object-contain mb-2 bg-gray-900 rounded" />
          {evolutionInfo.badge && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-2">
              <span className="text-2xl">{evolutionInfo.badge}</span>
            </div>
          )}
          
          {/* Small Action Buttons Overlapping Image */}
          <div className="absolute top-2 left-2 flex gap-1">
            {/* Name Button */}
            {(tokenId !== undefined && tokenId !== null) && onNameSubmit && (
              <div>
                {showNameInput ? (
                  <div className="bg-green-900 p-2 rounded border border-green-700 shadow-lg">
                    <input
                      type="text"
                      placeholder="Enter custom name..."
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="text-black px-2 py-1 rounded text-xs w-24"
                      maxLength={20}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleNameSave();
                        }
                      }}
                      autoFocus
                    />
                    <div className="flex gap-1 mt-1">
                      <button
                        className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs transition-colors"
                        onClick={handleNameSave}
                      >
                        Save
                      </button>
                      <button
                        className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs transition-colors"
                        onClick={() => {
                          setShowNameInput(false);
                          setNameInput('');
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-bold transition-colors shadow-lg"
                    onClick={() => setShowNameInput(true)}
                    title="Set Custom Name"
                  >
                    🏷️
                  </button>
                )}
              </div>
            )}
            
            {/* Lore Button */}
            {(tokenId !== undefined && tokenId !== null) && onLoreSubmit && (
              <div>
                {showLoreInput ? (
                  <div className="bg-blue-900 p-2 rounded border border-blue-700 shadow-lg">
                    <input
                      type="text"
                      placeholder="Enter lore..."
                      value={loreInput}
                      onChange={(e) => setLoreInput(e.target.value)}
                      className="text-black px-2 py-1 rounded text-xs w-24"
                      maxLength={50}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleLoreSave();
                        }
                      }}
                      autoFocus
                    />
                    <div className="flex gap-1 mt-1">
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition-colors"
                        onClick={handleLoreSave}
                      >
                        Save
                      </button>
                      <button
                        className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs transition-colors"
                        onClick={() => {
                          setShowLoreInput(false);
                          setLoreInput('');
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs font-bold transition-colors shadow-lg"
                    onClick={() => setShowLoreInput(true)}
                    title="Add/Update Lore"
                  >
                    📝
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      <h3 className="text-2xl font-bold mb-2">
        {name}
        {evolutionInfo.badge && <span title={evolutionInfo.stage} className="ml-2">{evolutionInfo.badge}</span>}
      </h3>
      <p className="text-lg">Level: {level}</p>
      <p className="text-lg">Type: {type}</p>
      <p className="text-lg">Experience: {experience}</p>
      <p className="text-sm text-gray-400">Evolution Stage: {evolutionInfo.stage}</p>
      {traits && (
        <div className="flex flex-wrap gap-2 my-2">
          {traits.split(',').map((trait, idx) => {
            const [key, value] = trait.split(':');
            return (
              <span key={idx} className="bg-blue-700 text-white px-2 py-1 rounded text-xs">
                {key}: {value}
              </span>
            );
          })}
        </div>
      )}
      {lore && <p className="italic text-sm text-gray-400">"{lore}"</p>}
      
      {/* Evolution Controls */}
      {canEvolve && (tokenId !== undefined && tokenId !== null) && (
        <div className="mt-4 p-3 bg-purple-900 rounded border border-purple-500">
          <p className="text-sm text-purple-200 mb-2">
            Ready to evolve to: <span className="font-bold">{evolutionInfo.nextStage}</span>
          </p>
          <button
            className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold transition-colors"
            onClick={async () => {
              if (!window.ethereum) return alert('Wallet not found');
              try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const contract = new ethers.Contract(MONANIMAL_NFT_ADDRESS, MonanimalNFTAbi.abi, signer);
                
                console.log('Starting evolution for tokenId:', tokenId);
                console.log('Current stage:', evolutionInfo.stage);
                console.log('Evolving to:', evolutionInfo.nextStage);
                
                // Determine the correct evolution indicator based on the target stage
                const evolutionIndicator = evolutionInfo.nextStage === 'Adult' ? '(Max Evolved)' : '(Evolved)';
                const newTraits = traits + ' ' + evolutionIndicator;
                const newLore = (lore || '') + ' ' + evolutionIndicator;
                
                const tx = await contract.evolve(tokenId, newTraits, newLore, 'ipfs://placeholder');
                console.log('Evolution transaction sent:', tx);
                
                // Wait for transaction confirmation
                await tx.wait();
                console.log('Evolution transaction confirmed');
                
                alert(`Evolution completed! ${name} is now ${evolutionInfo.nextStage}! 🎉`);
                
                // Call the callback to refresh the data
                if (onEvolve) onEvolve({ tokenId });
                
              } catch (error) {
                const err = error as any;
                console.error('Evolution error:', err);
                alert(`Evolution failed: ${err.message || String(err)}`);
              }
            }}
          >
            Evolve to {evolutionInfo.nextStage}
          </button>
        </div>
      )}
      
      {/* Max Evolution Indicator */}
      {isMaxEvolved && (
        <div className="mt-4 p-3 bg-gradient-to-r from-purple-900 to-pink-900 rounded border border-purple-500">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">🦄</span>
            <span className="font-bold text-purple-200">MAX EVOLUTION ACHIEVED!</span>
            <span className="text-2xl">🦄</span>
          </div>
          <p className="text-sm text-purple-200 text-center mt-1">
            This Monanimal has reached its full potential!
          </p>
        </div>
      )}
      
      {/* Burn Button */}
      {(tokenId !== undefined && tokenId !== null) && (
        <button
          className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded cursor-pointer transition-colors"
          onClick={async () => {
            console.log('Burn button clicked for tokenId:', tokenId);
            if (!window.ethereum) {
              console.log('No ethereum provider found');
              return alert('Wallet not found');
            }
            if (!confirm('Are you sure you want to burn this Monanimal? This action cannot be undone.')) {
              console.log('Burn cancelled by user');
              return;
            }
            console.log('Starting burn process...');
            try {
              const provider = new ethers.providers.Web3Provider(window.ethereum);
              const signer = provider.getSigner();
              const contract = new ethers.Contract(MONANIMAL_NFT_ADDRESS, MonanimalNFTAbi.abi, signer);
              console.log('Contract instance created, calling burn...');
              const tx = await contract.burn(tokenId);
              console.log('Burn transaction sent:', tx);
              await tx.wait();
              console.log('Burn transaction confirmed');
              alert('Monanimal burned successfully!');
              // Optionally refresh the page or update the UI
              window.location.reload();
            } catch (error) {
              const err = error as any;
              console.error('Burn error:', err);
              alert(`Failed to burn Monanimal: ${err.message || String(err)}`);
            }
          }}
        >
          Burn NFT
        </button>
      )}
    </div>
  );
}; 