const hre = require("hardhat");

async function main() {

  // build and deploy the contract
  await hre.run('compile');
  const Idea = await hre.thor.getContractFactory("Idea");
  const { abi } = await hre.artifacts.readArtifact('Idea');
  const idea = await Idea.deploy();

  // archive contract interface and address on the blockchain
  await idea.deployed();
  console.log("Ideas deployed to:", idea.address);
  require('fs').writeFileSync('src/contract.json', JSON.stringify({ address: idea.address, abi }, '', 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });