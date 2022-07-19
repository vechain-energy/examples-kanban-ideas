const { ethers } = require('hardhat')
const { BigNumber } = ethers

const contracts = {}
let owner
let user1
let user2

beforeEach(async function () {
  [owner, user1, user2] = await ethers.getSigners()

  const Idea = await ethers.getContractFactory('Idea')
  contracts.idea = await Idea.deploy()
})

describe('createIdea(title, description)', () => {
  it('mints token #0 for a new idea', async () => {
    const title = 'Test Title'
    const description = 'Test Description'

    const transaction = await contracts.idea.createIdea(title, description)
    const { events } = await transaction.wait()

    const { tokenId } = events.find(({ event }) => event === 'Transfer').args
    expect(tokenId).toEqual(BigNumber.from(0))
  })

  it('remembers title and description during minting', async () => {
    const title = 'Test Title'
    const description = 'Test Description'

    const tokenId = await createIdeaFor(user1, title, description)

    const attributes = await contracts.idea.tokenAttributes(tokenId)
    expect(attributes.title).toEqual(title)
    expect(attributes.description).toEqual(description)
  })
})

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
    await expect(contracts.idea.connect(user1).upvote(tokenId)).rejects.toThrow()
  })
})

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

async function createIdeaFor (user, ...args) {
  const { events } = await (await contracts.idea.connect(user).createIdea(...args)).wait()
  const { tokenId } = events.find(({ event }) => event === 'Transfer').args
  return tokenId
}
