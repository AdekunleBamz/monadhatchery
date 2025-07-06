const { ethers } = require("hardhat");

async function main() {
  const MonanimalNFT = await ethers.getContractFactory("MonanimalNFT");
  const contract = await MonanimalNFT.deploy();
  await contract.waitForDeployment();
  console.log("MonanimalNFT deployed to:", contract.target?.toString() || contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 