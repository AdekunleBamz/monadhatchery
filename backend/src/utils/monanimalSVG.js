// Utility to generate SVG and encode as data URL for Monanimal NFTs

export function generateMonanimalSVG({ name, traits, level, type }) {
  // Simple SVG based on Monanimal properties (customize as needed)
  return `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${type === 'Normal' ? '#aaf' : '#faa'}"/>
      <text x="50%" y="40%" dominant-baseline="middle" text-anchor="middle" font-size="32" fill="#222">${name}</text>
      <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="20" fill="#333">Traits: ${traits}</text>
      <text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" font-size="18" fill="#444">Level: ${level}</text>
      <text x="50%" y="75%" dominant-baseline="middle" text-anchor="middle" font-size="18" fill="#555">Type: ${type}</text>
    </svg>
  `;
}

export function svgToDataUrl(svg) {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
} 