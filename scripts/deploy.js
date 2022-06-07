const hre = require("hardhat");

async function main() {
  // We get the contract to deploy
  //allow us to deploy one specific instance of out contract
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  //nftMarketplace -> specific instance of our contract
  const nftMarketplace = await NFTMarketplace.deploy();

  await nftMarketplace.deployed();

  console.log("NFTMarketplace deployed to:", nftMarketplace.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
