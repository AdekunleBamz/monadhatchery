import React from 'react';

interface TraitSelectorProps {
  onChange: (traits: string) => void;
}

export const types = ['Fire', 'Water', 'Earth', 'Air', 'Electric'];
export const abilities = ['Swift', 'Strong', 'Wise', 'Stealthy', 'Lucky'];

export function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const TraitSelector: React.FC<TraitSelectorProps> = ({ onChange }) => {
  // Only let user pick color
  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="mb-4">
      <label className="block mb-2 font-bold text-white drop-shadow">Select Color:</label>
      <select onChange={handleSelect} className="p-2 rounded font-bold text-white bg-green-700 focus:bg-green-800 focus:text-lime-300 shadow-md">
        <option value="Red" className="font-bold text-lime-300 bg-green-900">Red</option>
        <option value="Blue" className="font-bold text-lime-300 bg-green-900">Blue</option>
        <option value="Green" className="font-bold text-lime-300 bg-green-900">Green</option>
      </select>
    </div>
  );
}; 