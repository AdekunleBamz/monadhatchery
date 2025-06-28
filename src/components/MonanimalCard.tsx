import React from 'react';

interface MonanimalCardProps {
  name: string;
  level: number;
  type: string;
  experience: number;
  traits?: string;
  lore?: string;
}

export const MonanimalCard: React.FC<MonanimalCardProps> = ({ name, level, type, experience, traits, lore }) => (
  <div className="bg-gray-800 rounded-lg p-6 shadow-lg flex flex-col gap-2">
    <h3 className="text-2xl font-bold mb-2">{name}</h3>
    <p>Level: {level}</p>
    <p>Type: {type}</p>
    <p>Experience: {experience}</p>
    {traits && <p>Traits: {traits}</p>}
    {lore && <p className="italic text-sm text-gray-400">{lore}</p>}
  </div>
); 