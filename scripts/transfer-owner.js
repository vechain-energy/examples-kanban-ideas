const hre = require("hardhat");

async function main() {
  const newOwner = process.argv[2]
  const { address } = JSON.parse(require('fs').readFileSync('src/contract.json'))

  const idea = await hre.thor.getContractAt('Idea', address)
  await idea.transferOwnership(newOwner)
  console.log("Ownership transferred to:", newOwner)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });