"use client";

import { useEffect, useState } from 'react';

interface LeaderboardEntry {
  address: string;
  nftsOwned: number;
  totalEvolutions: number;
  loreSubmissions: number;
  achievements?: {
    badges?: string[];
  };
}

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';
const API_URL = RAW_API_URL.replace(/\/?api\/?$/, ''); // Remove trailing /api or /api/

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_URL}/api/leaderboard`);
        if (!res.ok) throw new Error('Failed to fetch leaderboard');
        const leaderboard = await res.json();
        setData(leaderboard);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 relative overflow-hidden">
      {/* Soft vignette effect */}
      <div className="pointer-events-none absolute inset-0 z-0" style={{background: 'radial-gradient(ellipse at center, rgba(163,230,53,0.10) 0%, rgba(10,10,10,0.95) 80%)'}} />
      <div className="max-w-3xl w-full py-12 px-4 z-10 relative">
        <h1 className="text-3xl font-bold mb-6 text-center drop-shadow-lg text-lime-300">Leaderboard</h1>
        {loading ? (
          <div className="text-center text-gray-400">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800/90 rounded-lg shadow-2xl backdrop-blur-md">
              <thead>
                <tr className="bg-gray-700/80 text-lime-300">
                  <th className="py-2 px-4 text-left">Address</th>
                  <th className="py-2 px-4 text-center">NFTs Owned</th>
                  <th className="py-2 px-4 text-center">Evolutions</th>
                  <th className="py-2 px-4 text-center">Lore Submissions</th>
                  <th className="py-2 px-4 text-center">Badges</th>
                </tr>
              </thead>
              <tbody>
                {data.map((entry, idx) => (
                  <tr key={entry.address} className={idx % 2 === 0 ? 'bg-gray-900/80' : 'bg-gray-800/80'}>
                    <td className="py-2 px-4 font-mono text-xs truncate max-w-xs" title={entry.address}>{entry.address}</td>
                    <td className="py-2 px-4 text-center font-bold text-lime-300">{entry.nftsOwned}</td>
                    <td className="py-2 px-4 text-center text-blue-300">{entry.totalEvolutions}</td>
                    <td className="py-2 px-4 text-center text-yellow-300">{entry.loreSubmissions}</td>
                    <td className="py-2 px-4 text-center">
                      {/* Show up to 2 most recent badges, fallback to none */}
                      {entry.achievements && Array.isArray(entry.achievements.badges) && entry.achievements.badges.length > 0 ? (
                        entry.achievements.badges.slice(-2).map((badge, i) => (
                          <span key={badge} className="inline-block bg-gradient-to-r from-lime-500 to-blue-400 text-xs text-white font-semibold rounded-full px-2 py-1 mx-1 shadow-md border border-lime-300 animate-pulse">
                            🏅 {badge}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 