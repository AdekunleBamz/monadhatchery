import React from 'react';

interface TraitSelectorProps {
  onChange: (traits: string) => void;
}

export const TraitSelector: React.FC<TraitSelectorProps> = ({ onChange }) => {
  // Example: let user pick a color, type, and ability
  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const traits = `color:${e.target.value},type:Fire,ability:Swift`;
    onChange(traits);
  };

  return (
    <div className="mb-4">
      <label className="block mb-2 font-bold">Select Color:</label>
      <select onChange={handleSelect} className="p-2 rounded text-black">
        <option value="Red">Red</option>
        <option value="Blue">Blue</option>
        <option value="Green">Green</option>
      </select>
    </div>
  );
}; 