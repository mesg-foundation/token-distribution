const Web3 = require('web3')
const csv = require('csvtojson')
const BigNumber = require('bignumber.js')
const fs = require('fs')

// const tokenABI = require('../build/contracts/IERC20.json').abi
const distributionABI = require('../build/contracts/Distribution.json').abi

const infuraKey = process.env.MESG_TOKEN_INFURA_KEY
// const tokenSC = process.env.MESG_TOKEN_SC
const distributionSC = process.env.MESG_DISTRIBUTION_SC
const bountyAddress = process.env.MESG_DISTRIBUTION_ADDRESS
// const distributionCreatorPK = process.env.MESG_CREATOR_PK

const decimals = 1e18
const txDataFile = './txdata.txt'

const main = async () => {
  const web3 = new Web3('https://mainnet.infura.io/v3/' + infuraKey)
  // const token = new web3.eth.Contract(tokenABI, tokenSC)
  const distribution = new web3.eth.Contract(distributionABI, distributionSC)

  const records = await csv().fromFile(process.argv[2])
  console.log('records', records)

  const addresses = []
  const amounts = []
  records.forEach(record => {
    addresses.push(record.address)
    amounts.push(new BigNumber(record.amount).multipliedBy(decimals).toString())
  })
  console.log('addresses', addresses)
  console.log('amounts', amounts)

  const sum = amounts.reduce((p, c, i) => {
    return p.plus(new BigNumber(c))
  }, new BigNumber(0))
  console.log('sum', sum.toString())

  // const wallet = web3.eth.accounts.wallet.add(distributionCreatorPK)

  const transactionData = await distribution.methods.distribute(addresses, amounts).encodeABI()
  // console.log('transactionData', transactionData)
  const gas = await distribution.methods.distribute(addresses, amounts).estimateGas({ from: bountyAddress })
  console.log('gas', gas)

  console.log('last nonce', await web3.eth.getTransactionCount(bountyAddress))

  // const signedTx = await web3.eth.accounts.signTransaction({
  //   // nonce: '1',
  //   // chainId: 1,
  //   to: distributionSC,
  //   value: 0,
  //   gas: '125070',
  //   // gasPrice: '41000000',
  //   data: transactionData
  // }, distributionCreatorPK)
  // console.log('signedTx', signedTx)

  // const signedTx = await wallet.signTransaction({
  //   // nonce: '1',
  //   // chainId: 1,
  //   to: distributionSC,
  //   value: 0,
  //   gas: 100000,
  //   // gas: '125070',
  //   gasPrice: '41000000000',
  //   data: transactionData
  // })
  // console.log('signedTx', signedTx)

  // web3.eth.sendSignedTransaction(signedTx.rawTransaction)
  //   .on('receipt', console.log)
  //   .on('confirmation', console.log)
  //   .on('transactionHash', console.error)
  //   .on('error', console.log)

  fs.writeFile(txDataFile, transactionData, (err) => {
    if (err) throw err
    console.log('The transaction data has been saved to', txDataFile)
  })
}

try {
  main()
    .catch(error => console.error('catch promise', error))
} catch (error) {
  console.error('catch try', error)
}
