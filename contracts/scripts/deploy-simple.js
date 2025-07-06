const { ethers } = require("hardhat");

async function main() {
  const SimpleMonanimalNFT = await ethers.getContractFactory("SimpleMonanimalNFT");
  const contract = await SimpleMonanimalNFT.deploy();
  await contract.waitForDeployment();
  console.log("SimpleMonanimalNFT deployed to:", contract.target?.toString() || contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 