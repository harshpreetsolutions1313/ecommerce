const { ethers } = require('ethers');
const contractABI = require('../EcommercePayment.json');

// Read-only provider & contract (no private key)
const provider = new ethers.JsonRpcProvider(process.env.BSC_RPC_URL, {
  chainId: 97, // BSC Testnet
  name: 'bsc-testnet',
});

const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractABI,
  provider
);

module.exports = contract;