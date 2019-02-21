/* global artifacts */

const Distribution = artifacts.require('Distribution')
const MESGToken = artifacts.require('MESGToken')

module.exports = async (deployer, network) => {
  let tokenSC = null
  switch (network) {
    case 'mainnet':
    case 'ropsten':
    case 'kovan':
      tokenSC = process.env.MESG_TOKEN_SC
      break
    default:
      await deployer.deploy(MESGToken, 'MESG Token Test', 'MESG', 18, 250000000)
      tokenSC = MESGToken.address
  }
  await deployer.deploy(Distribution, tokenSC)
}
