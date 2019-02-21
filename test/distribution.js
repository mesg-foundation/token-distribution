/* eslint-env mocha */
/* global contract, artifacts */

const assert = require('chai').assert
const web3 = require('web3')

const Distribution = artifacts.require('Distribution')
const MESGToken = artifacts.require('MESGToken')
const truffleAssert = require('truffle-assertions')

const BN = x => new web3.utils.BN(x)

const distribute = async (distribution, token, from, addresses, amounts) => {
  assert.equal(addresses.length, amounts.length, 'addresses and accounts do not have same length')

  // calculate sum
  const sum = amounts.reduce((p, c) => p.add(BN(c)), BN(0))

  // approve smart contract to distribute the sum
  await token.approve(distribution.address, sum.toString(), { from })
  assert.isTrue((await token.allowance(from, distribution.address)).eq(sum))

  // distribute
  await distribution.distribute(addresses, amounts, { from })

  // check distribution
  const balances = await Promise.all(addresses.map(address => token.balanceOf(address)))
  balances.forEach((balance, i) => {
    assert.isTrue(balance.eq(BN(amounts[i])))
  })
}

contract('Distribute', async ([ owner, other ]) => {
  let distribution = null
  let token = null

  before(async () => {
    token = await MESGToken.new('MESG', 'MESG', 18, 25 * 10e6, { from: owner })
    distribution = await Distribution.new(token.address, { from: owner })
  })

  describe('ownership', async () => {
    it('should have the right owner', async () => {
      assert.isTrue(await distribution.isOwner({ from: owner }))
    })
  })

  describe('destroy', async () => {
    it('should revert when called not by owner', async () => {
      await truffleAssert.reverts(distribution.destroy({ from: other }))
      assert.isTrue(await distribution.isOwner({ from: owner }))
    })

    it('should be destroyable', async () => {
      await distribution.destroy({ from: owner })
    })
  })
})

contract('Distribute', async ([
  owner,
  other,
  ...accounts
]) => {
  let distribution = null
  let token = null

  beforeEach(async () => {
    token = await MESGToken.new('MESG', 'MESG', 18, 25 * 10e6, { from: owner })
    distribution = await Distribution.new(token.address, { from: owner })
  })

  describe('distribute', async () => {
    it('should distribute tokens to 2 addresses', async () => {
      await token.approve(distribution.address, '30', { from: owner })
      assert.equal((await token.allowance(owner, distribution.address)).toString(), '30')
      await distribution.distribute([
        accounts[0], accounts[1]
      ], [
        '10', '20'
      ], { from: owner })
      assert.equal(await token.balanceOf(accounts[0]), '10')
      assert.equal(await token.balanceOf(accounts[1]), '20')
    })

    it('should distribute tokens to 50 addresses', async () => {
      const number = 50
      const addresses = require('./addresses.json').slice(0, number)
      const amounts = []
      for (let i = 0; i < number; i++) {
        amounts.push(Math.floor((Math.random() * 100) + 1))
      }
      await distribute(distribution, token, owner, addresses, amounts)
    })

    it('should distribute tokens to 200 addresses', async () => {
      const number = 200
      const addresses = require('./addresses.json').slice(0, number)
      const amounts = []
      for (let i = 0; i < number; i++) {
        amounts.push(Math.floor((Math.random() * 100) + 1))
      }
      await distribute(distribution, token, owner, addresses, amounts)
    })
  })
})
