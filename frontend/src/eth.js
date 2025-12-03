import { BrowserProvider, Contract, parseUnits } from 'ethers'
import ecommerceAbi from '../../EcommercePayment.json'

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS
const USDT_ADDRESS = import.meta.env.VITE_USDT_ADDRESS
const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS

function assertAddress(value, label) {
  if (!value) {
    throw new Error(`${label} is not configured. Please set it in frontend .env`)
  }
  return value
}

// Minimal ERC20 ABI: balanceOf, allowance, approve, decimals
const erc20Abi = [
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
]

export async function getProviderAndSigner() {
  if (!window.ethereum) {
    throw new Error('MetaMask not found')
  }
  const provider = new BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()

  const network = await provider.getNetwork()
  if (Number(network.chainId) !== 97) {
    throw new Error('Please switch MetaMask to BSC Testnet (chainId 97)')
  }

  return { provider, signer }
}

export async function createOrderOnChain({ buyer, productId, amount }) {
  const { signer } = await getProviderAndSigner()

  const contractAddress = assertAddress(CONTRACT_ADDRESS, 'Contract address')
  const contract = new Contract(contractAddress, ecommerceAbi, signer)

  const amountWei = parseUnits(amount.toString(), 18)
  const tx = await contract.createOrder(buyer, productId, amountWei)
  const receipt = await tx.wait()

  const parsedEvents = receipt.logs
    .map((log) => {
      try {
        return contract.interface.parseLog(log)
      } catch {
        return null
      }
    })
    .filter(Boolean)

  const orderCreated = parsedEvents.find((e) => e.name === 'OrderCreated')
  if (!orderCreated) {
    throw new Error('OrderCreated event not found in transaction receipt')
  }

  const orderId = orderCreated.args.orderId.toString()

  return { orderId, txHash: receipt.hash }
}

export async function payForOrderOnChain({ orderId, tokenSymbol, amount }) {
  const { signer } = await getProviderAndSigner()

  const contractAddress = assertAddress(CONTRACT_ADDRESS, 'Contract address')
  const tokenAddress = tokenSymbol === 'USDT'
    ? assertAddress(USDT_ADDRESS, 'USDT address')
    : assertAddress(USDC_ADDRESS, 'USDC address')

  // Instantiate payment contract
  const contract = new Contract(contractAddress, ecommerceAbi, signer)

  // From the UI we treat price as "whole tokens" and assume 18 decimals on mocks
  const amountWei = parseUnits(amount.toString(), 18)

  // Check balance & allowance on token
  const user = await signer.getAddress()
  const tokenContract = new Contract(tokenAddress, erc20Abi, signer)

  const balance = await tokenContract.balanceOf(user)
  if (balance < amountWei) {
    throw new Error('Insufficient token balance for this purchase')
  }

  const allowance = await tokenContract.allowance(user, contractAddress)
  if (allowance < amountWei) {
    const approveTx = await tokenContract.approve(contractAddress, amountWei)
    await approveTx.wait()
  }

  const tx = await contract.payForOrder(orderId, tokenAddress, amountWei)
  const receipt = await tx.wait()

  return {
    txHash: receipt.hash,
  }
}


