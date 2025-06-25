async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const MonanimalNFT = await ethers.getContractFactory("MonanimalNFT");
  const contract = await MonanimalNFT.deploy();
  if (contract.waitForDeployment) {
    await contract.waitForDeployment(); // ethers v6
    console.log("MonanimalNFT deployed to:", contract.target?.toString());
  } else {
    await contract.deployed(); // ethers v5
    console.log("MonanimalNFT deployed to:", contract.address);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 