import fetch from 'node-fetch';

async function testAPI() {
  try {
    // Test creating a user
    const createUserResponse = await fetch('http://localhost:4001/api/progress/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: '0x123test',
        points: 100,
        progress: 50,
      }),
    });
    
    const user = await createUserResponse.json();
    console.log('Created user:', user);

    // Test creating a Monanimal
    const createMonanimalResponse = await fetch('http://localhost:4001/api/monanimal/mint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokenId: 1,
        owner: '0x123test',
        traits: 'fire:red,wings:large',
        lore: 'A legendary fire Monanimal',
      }),
    });

    const monanimal = await createMonanimalResponse.json();
    console.log('Created Monanimal:', monanimal);

    // Test getting user progress
    const getUserResponse = await fetch('http://localhost:4001/api/progress/0x123test');
    const userData = await getUserResponse.json();
    console.log('User data:', userData);

    // Test getting leaderboard
    const leaderboardResponse = await fetch('http://localhost:4001/api/leaderboard');
    const leaderboard = await leaderboardResponse.json();
    console.log('Leaderboard:', leaderboard);

  } catch (error) {
    console.error('Error:', error);
  }
}

testAPI(); 