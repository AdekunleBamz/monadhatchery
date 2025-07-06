// Utility to generate expressive SVG Monanimal images for NFTs

import { createAvatar } from '@dicebear/core';
import { bottts } from '@dicebear/collection'; // You can try 'avataaars', 'micah', etc.

function pickEye(traits) {
  // Example: pick eye style based on traits string
  if (traits.includes('Fire')) return 'circle';
  if (traits.includes('Water')) return 'oval';
  if (traits.includes('Mystic')) return 'star';
  return 'dot';
}

function pickMouth(traits) {
  if (traits.includes('Happy')) return 'smile';
  if (traits.includes('Angry')) return 'frown';
  return 'neutral';
}

function pickAccessory(traits) {
  if (traits.includes('Hat')) return 'hat';
  if (traits.includes('Wings')) return 'wings';
  return null;
}

function bodyColor(type) {
  switch (type) {
    case 'Fire': return '#ffb347';
    case 'Water': return '#6ec6f3';
    case 'Mystic': return '#b39ddb';
    case 'Earth': return '#a5d6a7';
    default: return '#aaf';
  }
}

function monadBackground() {
  // Monad-inspired: a glowing ring
  return `<ellipse cx="200" cy="200" rx="160" ry="160" fill="none" stroke="#ffd700" stroke-width="12" opacity="0.4"/>`;
}

function renderEyes(style) {
  switch (style) {
    case 'circle':
      return `<circle cx="150" cy="200" r="18" fill="#fff"/><circle cx="250" cy="200" r="18" fill="#fff"/>
              <circle cx="150" cy="200" r="8" fill="#222"/><circle cx="250" cy="200" r="8" fill="#222"/>`;
    case 'oval':
      return `<ellipse cx="150" cy="200" rx="14" ry="20" fill="#fff"/><ellipse cx="250" cy="200" rx="14" ry="20" fill="#fff"/>
              <ellipse cx="150" cy="200" rx="6" ry="8" fill="#222"/><ellipse cx="250" cy="200" rx="6" ry="8" fill="#222"/>`;
    case 'star':
      return `<polygon points="145,200 150,190 155,200 150,210" fill="#fff"/>
              <polygon points="245,200 250,190 255,200 250,210" fill="#fff"/>
              <circle cx="150" cy="200" r="5" fill="#222"/><circle cx="250" cy="200" r="5" fill="#222"/>`;
    default:
      return `<circle cx="150" cy="200" r="10" fill="#222"/><circle cx="250" cy="200" r="10" fill="#222"/>`;
  }
}

function renderMouth(style) {
  switch (style) {
    case 'smile':
      return `<path d="M170 240 Q200 270 230 240" stroke="#222" stroke-width="5" fill="none"/>`;
    case 'frown':
      return `<path d="M170 255 Q200 225 230 255" stroke="#222" stroke-width="5" fill="none"/>`;
    default:
      return `<line x1="175" y1="245" x2="225" y2="245" stroke="#222" stroke-width="5"/>`;
  }
}

function renderAccessory(accessory) {
  switch (accessory) {
    case 'hat':
      return `<rect x="130" y="140" width="140" height="30" rx="15" fill="#333"/><rect x="160" y="120" width="80" height="30" rx="15" fill="#555"/>`;
    case 'wings':
      return `<ellipse cx="90" cy="220" rx="30" ry="60" fill="#e0e0e0" opacity="0.7"/>
              <ellipse cx="310" cy="220" rx="30" ry="60" fill="#e0e0e0" opacity="0.7"/>`;
    default:
      return '';
  }
}

export function generateMonanimalSVG({ traits, tokenId }) {
  // Use traits or tokenId as seed for uniqueness
  const seed = traits ? traits : `monanimal-${tokenId}`;
  const svg = createAvatar(bottts, {
    seed,
    // You can add more options here for customization
  }).toString();
  return svg;
}

export function svgToDataUrl(svg) {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
} 