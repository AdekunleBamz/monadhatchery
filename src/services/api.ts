export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

export const fetchUserMonanimals = async (address: string) => {
  const response = await fetch(`${API_BASE_URL}/users/${address}/monanimals`);
  if (!response.ok) {
    throw new Error('Failed to fetch user monanimals');
  }
  return response.json();
};

export const mintMonanimal = async (address: string) => {
  const response = await fetch(`${API_BASE_URL}/users/${address}/mint`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to mint monanimal');
  }
  return response.json();
};

// ... rest of the code stays the same ... 