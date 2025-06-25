export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

export const fetchUserMonanimals = async (address: string) => {
  const response = await fetch(`${API_BASE_URL}/users/${address}/monanimals`);
  if (!response.ok) {
    throw new Error('Failed to fetch user monanimals');
  }
  return response.json();
};

export const mintMonanimal = async (address: string) => {
  // Generate dummy data for now
  const payload = {
    tokenId: Math.floor(Math.random() * 1000000), // unique ID for demo
    owner: address,
    traits: 'default:default', // placeholder traits
    lore: 'A newly minted Monanimal', // placeholder lore
  };

  const response = await fetch(`${API_BASE_URL}/monanimal/mint`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error('Failed to mint monanimal');
  }
  return response.json();
};

// ... rest of the code stays the same ... 