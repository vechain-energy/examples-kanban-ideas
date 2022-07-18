# Summary

In the upcoming months some blog entries will be written with sample projects. To widen the pool of ideas, everyone is welcome to submit ideas. Everyone can vote with their wallet to increase priority for certain ideas.

This tutorial leads thru that initial project which will be a kanban board with the following features:

1. Ideas can be created by everyone with:
   1. Title
   1. Description
1. Everyone can upvote an idea to increase the priority
1. Ideas are grouped in a Kanban style board with the following columns for progress tracking:
   1. Idea
   1. In Progress
   1. Done
   1. Cancelled
   1. … only an admin can change the state
1. No spam or abuse protection in the MVP

## Structure

### Data storage on the Blockchain

An Idea will be a standard NFT Token with the following attributes:

1. `(Text)` Title
1. `(Text)` Description
1. `(Address)` Owner = creator of the idea
1. `(uint)` Upvotes
1. `(address[])` List of Upvoters
1. `(uint)` Status / Progress / Column

### Interface

A react web application with standard antd components:

1. Columns for each status
1. List of Ideas within each column
   1. sorted by upvotes
   1. ability to see details (Title, Description, Creator, Upvotes)
1. Connect Wallet ability, if connected:
   1. see own upvote status
   1. and ability to upvote ideas (once)
   1. ability to create add new ideas
   1. (if admin) ability to change status of an idea

# Project Setup

Initialize project with an empty react project to have a directory structure:

```shell
yarn create react-app kanban
cd kanban
```

## Hardhat

```shell
yarn add --dev hardhat @nomiclabs/hardhat-waffle @nomiclabs/hardhat-ethers @vechain.energy/hardhat-thor @openzeppelin/contracts hardhat-jest-plugin nodemon
npx hardhat

✔ What do you want to do? · Create an empty hardhat.config.js
✨ Config file created ✨
```

configure vechain and plugins in `hardhat.config.js`:

```js
require("@nomiclabs/hardhat-waffle");
require('@vechain.energy/hardhat-thor')
require("hardhat-jest-plugin")

module.exports = {
 solidity: "0.8.4",
 networks: {
    vechain: {
      url: 'https://testnet.veblocks.net',
      privateKey: "0x80b97e2ecfab8b1c78100c418328e8a88624e3d19928ec791a8a51cdcf01f16f",
      delegateUrl: 'https://sponsor-testnet.vechain.energy/by/90',
      blockGasLimit: 10000000
    }
  }
};
```

Init jest tests:

```shell
$ npx jest --init  

The following questions will help Jest to create a suitable configuration for your project

✔ Would you like to use Jest when running "test" script in "package.json"? … no
✔ Would you like to use Typescript for the configuration file? … no
✔ Choose the test environment that will be used for testing › node
✔ Do you want Jest to add coverage reports? … no
✔ Which provider should be used to instrument code for coverage? › v8
✔ Automatically clear mock calls, instances and results before every test? … yes

📝  Configuration file created at ./jest.config.js

```

Delete reacts example test to not get mixed up with contract tests:

```shell
$ rm src/App.test.js
```

To execute hardhat tests easily, a new script `contract:test` and `contract:test:watch` is added to `package.json`:

```json
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "contract:test": "hardhat test:jest",
    "contract:test:watch": "nodemon -e sol --exec 'hardhat test:jest --watch'"
  },
```


# Data Storage / Contract

To keep it as simple as possible, OpenZeppelin will serve as source of the NFT Contract:  
https://wizard.openzeppelin.com/#erc721

![Contract Wizard](./docs/Contract%20Wizard.png)

The configured contract is stored in `contracts/Idea.sol`.

## Create Ideas

A public function to create an Idea is the first thing required. The requirement stats Ideas can be created by everyone with a Title and Description. Thats as simple as:

```js
function createIdea(title, description) public {}
```

### Minting Test

The initial test can just verify that the minting works by verifying that it creates token #0:

```js
describe('createIdea(title, description)', () => {
  it('mints token #0 for a new idea', async () => {
    const title = 'Test Title'
    const description = 'Test Description'

    const transaction = await contracts.idea.createIdea(title, description)
    const { events } = await transaction.wait()

    const { tokenId } = events.find(({ event }) => event === 'Transfer').args
    expect(tokenId).toEqual(BigNumber.from(0))
  })
})
```

Run `yarn contract:test:watch` in a terminal and watch what happens. It fails right now, because the contract function does not exist yet.

### Minting Logic

A simple starting point that just mints Ideas is creating a new token and not care much about the data yet:

```solidity
function createIdea(string memory title, string memory description) public {
    uint256 tokenId = _tokenIdCounter.current();
    _tokenIdCounter.increment();
    _safeMint(msg.sender, tokenId);
    _setTokenURI(tokenId, title);
}
```

Tests will be successful now:

```shell
 PASS  contracts/Ideas.test.js
  createIdea(title, description)
    ✓ mints token #0 for a new idea (311 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
```

### Notes

In tests creating Ideas will be used a lot, thats why a helper function that calls `createIdea` from different user perspectives and returns the new tokenId is very useful:

```js
async function createIdeaFor (user, ...args) {
  const { events } = await (await contracts.idea.connect(user).createIdea(...args)).wait()
  const { tokenId } = events.find(({ event }) => event === 'Transfer').args
  return tokenId
}
```


## Support for additonal attributes

An Idea has several attributes, this is the list:

1. `(Text)` Title
1. `(Text)` Description
1. `(Address)` Owner = creator of the idea
1. `(uint)` Upvotes
1. `(address[])` List of Upvoters
1. `(uint)` Status / Progress / Column

Attributes for a single data object can be desecribed with a data structure that is assigned to each token:

```sol
struct Attributes {
    string title;
    string description;
    uint upvotes;
    mapping(address => bool) addressVoted;
    uint status;
}

mapping(uint256 =>  Attributes) public tokenAttributes;
```

## Title & Description

Due the `public` declarataion of the `tokenAttributes` the data is already available from the outside. It can be expected like this:

```js
it('remembers title and description during minting', async () => {
  const title = 'Test Title'
  const description = 'Test Description'

  const tokenId = await createIdeaFor(user1, title, description)

  const attributes = await contracts.idea.tokenAttributes(tokenId)
  expect(attributes.title).toEqual(title)
  expect(attributes.description).toEqual(description)
})
```

And writing can be done within `createIdea`:

```sol
function createIdea(string memory title, string memory description) public {
    uint256 tokenId = _tokenIdCounter.current();
    _tokenIdCounter.increment();
    _safeMint(msg.sender, tokenId);
    _setTokenURI(tokenId, title);

    tokenAttributes[tokenId].title = title;             // <-- remember title
    tokenAttributes[tokenId].description = description; // <-- remember description
}
```


## Upvotes

Upvotes require a little more logic, while everyone can upvote an idea to increase the priority, upvoting should only be possible one for every wallet.

The function for upvoting can look like this:

```js
function upvote(tokenId) public {}
```

The test for that functionality can describe expectations better:

```js
describe('upvote(tokenId)', () => {
  it('increments the upvote counter', async () => {
    const tokenId = await createIdeaFor(user1, 'title', 'description')
    await contracts.idea.connect(user1).upvote(tokenId)
    const attributes = await contracts.idea.tokenAttributes(tokenId)
    expect(attributes.upvotes).toEqual(BigNumber.from(1))
  })

  it('rejects multiple upvotes from the same user', async () => {
    const tokenId = await createIdeaFor(user1, 'title', 'description')
    await contracts.idea.connect(user1).upvote(tokenId)
    await expect(contracts.idea.connect(user1).upvote(tokenId)).rejects.toEqual({ error: 'already upvoted' })
  })
})
```

On the logic side it is an increment for the upvotes and reject an increment if the address has already upvoted:

```sol
function upvote(uint256 tokenId) public {
    require(!tokenAttributes[tokenId].addressVoted[msg.sender], "already upvoted");
    tokenAttributes[tokenId].addressVoted[msg.sender] = true;

    tokenAttributes[tokenId].upvotes++;
}
```

Testing now shows four green checkmarks:

```shell
 PASS  contracts/Ideas.test.js
  createIdea(title, description)
    ✓ mints token #0 for a new idea (330 ms)
    ✓ remembers title and description during minting (96 ms)
  upvote(tokenId)
    ✓ increments the upvote counter (77 ms)
    ✓ rejects multiple upvotes from the same user (102 ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
```


## Status / Administration

The status of an Idea needs to be changed by someone authorized. In the OpenZeppelin template `Ownable` was used for access control management which makes it simply to restrict single functions to only the contract owner.

The expected function can look like this:

```js
function setStatus(tokenId, status) public onlyOwner {}
```

Thats how the expectation are tested:

```
describe('setStatus(tokenId, status)', () => {
  it('remembers status correctly', async () => {
    const status = BigNumber.from(2)
    const tokenId = await createIdeaFor(user1, 'title', 'description')

    await contracts.idea.connect(owner).setStatus(tokenId, status)

    const attributes = await contracts.idea.tokenAttributes(tokenId)
    expect(attributes.status).toEqual(status)
  })

  it('rejects access for regular users', async () => {
    const status = BigNumber.from(2)
    const tokenId = await createIdeaFor(user1, 'title', 'description')

    await expect(contracts.idea.connect(user1).setStatus(tokenId, status)).rejects.toThrow()
  })
})
```

The logic makes use of the `onlyOwner` modifier that enforces access to this function for the current contract owner:

```sol
function setStatus(uint256 tokenId, uint status) public onlyOwner {
    tokenAttributes[tokenId].status = status;
}
```

Tests should be all green again:

```shell
 PASS  contracts/Ideas.test.js
  createIdea(title, description)
    ✓ mints token #0 for a new idea (339 ms)
    ✓ remembers title and description during minting (101 ms)
  upvote(tokenId)
    ✓ increments the upvote counter (80 ms)
    ✓ rejects multiple upvotes from the same user (103 ms)
  setStatus(tokenId, status)
    ✓ remembers status correctly (76 ms)
    ✓ rejects access for regular users (63 ms)

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
```

## Deployment

The contract is now feature complete and can be deployed to the blockchain to move on to a user interface.

The user interface will require information about the contracts address and its interface definition. Both are written into `src/contract.json` for access within the react application:

```js
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
```

Storing the script at `scripts/deploy.js` and running it deploys it to the network:

```shell
$ node scripts/deploy.js 
Nothing to compile
Ideas deployed to: 0x867B9B2A6B3D05902a0bc6Eb4Bc8570e3694B99B
```

### Ownership-Transfer

With the deployment the owner of the contract is the deployer configured in `hardhat.config.js`. To transfer the ownership to a different wallet the standard function `transferOwnership` provided by the OpenZeppelin templates can help:

```js
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
```

Storing the script at `scripts/transfer-owner.js` and running it with the new owner as argument will transfer the ownership:

```shell
$ node scripts/transfer-owner.js 0x8C59c63d6458C71B6FF88D57698437524a703084
Ownership transferred to: 0x8C59c63d6458C71B6FF88D57698437524a703084
```

## Resume

With the previous sections a test-driven approach was used to implement standard functionality.

A simple data structure stores all relevant data for a single object. Relying on existing functionality saved a lot of time on custom development for managing new tokens and reading data is made simply defining contract properties as public.