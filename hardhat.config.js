require('@nomiclabs/hardhat-ethers');
require('dotenv').config();

module.exports = {
  solidity: {
    compilers: [
      { version: '0.8.20' },
      { version: '0.8.28' }
    ]
  },
  networks: {
    monad: {
      url: 'https://testnet-rpc.monad.xyz', // Monad testnet RPC
      accounts: [process.env.PRIVATE_KEY],
    },
  },
}; 