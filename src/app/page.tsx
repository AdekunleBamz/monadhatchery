'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Image from 'next/image';
import { MonanimalCard } from '../components/MonanimalCard';
import { ForgeInterface } from '../components/ForgeInterface';
import { FusionInterface } from '../components/FusionInterface';
import { fetchUserMonanimals, mintMonanimal } from '../services/api';
import { WalletConnect } from '../components/WalletConnect';

interface Monanimal {
  _id: string;
  name: string;
  level: number;
  type: string;
  experience: number;
  traits?: string;
  lore?: string;
}

export default function Home() {
  const { address, isConnected } = useAccount();
  const [userMonanimals, setUserMonanimals] = useState<Monanimal[]>([]);
  const [loading, setLoading] = useState(true);
  const [minting, setMinting] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      if (isConnected && address) {
        try {
          const data = await fetchUserMonanimals(address);
          setUserMonanimals(data);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
      setLoading(false);
    };
    loadUserData();
  }, [address, isConnected]);

  const handleMint = async () => {
    if (!address) return;
    setMinting(true);
    try {
      const newMonanimal = await mintMonanimal(address);
      setUserMonanimals([...userMonanimals, newMonanimal]);
    } catch (error) {
      console.error('Error minting monanimal:', error);
    } finally {
      setMinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <nav className="bg-gray-800 p-4 shadow-lg border-2 border-yellow-400">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Monad Hatchery</h1>
          <WalletConnect />
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {!isConnected ? (
          <div className="text-center py-16">
            <h2 className="text-4xl font-bold mb-8">Welcome to Monad Hatchery</h2>
            <p className="text-xl mb-8">Connect your wallet to start your journey!</p>
            <div className="flex justify-center">
              <Image
                src="/globe.svg"
                alt="Monad Hatchery Logo"
                width={200}
                height={200}
                className="animate-pulse"
              />
            </div>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <h2 className="text-4xl font-bold mb-8">Your Monanimals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userMonanimals.map((monanimal: Monanimal) => (
                <MonanimalCard
                  key={monanimal._id}
                  name={monanimal.name}
                  level={monanimal.level}
                  type={monanimal.type}
                  experience={monanimal.experience}
                  traits={monanimal.traits}
                  lore={monanimal.lore}
                />
              ))}
            </div>
            {userMonanimals.length === 0 && (
              <div className="text-center py-12">
                <p className="text-xl">You don&apos;t have any Monanimals yet.</p>
                <button 
                  onClick={handleMint}
                  disabled={minting}
                  className={`mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${minting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {minting ? 'Minting...' : 'Mint Your First Monanimal'}
                </button>
              </div>
            )}
            <ForgeInterface />
            <FusionInterface />
          </>
        )}
      </main>
    </div>
  );
}
