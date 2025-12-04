const { ethers } = require('ethers');
const contractABI = require('../EcommercePayment.json');

// const provider = new ethers.providers.JsonRpcProvider(process.env.BSC_RPC_URL);

const provider = new ethers.JsonRpcProvider(process.env.BSC_RPC_URL, {
    // chainId: 97, // for BSC Testnet
    chainId: 56, // for BSC Mainnet
    // name: 'bsc-testnet'
    name: 'Binance Smart Chain Mainnet'
});

const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider); // will be removed

const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractABI,
  signer
);

module.exports = contract;