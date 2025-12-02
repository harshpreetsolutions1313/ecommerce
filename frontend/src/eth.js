import { BrowserProvider, Contract, parseUnits } from 'ethers'
import ecommerceAbi from '../../EcommercePayment.json'

// BSC testnet config
export const CONTRACT_ADDRESS = '0xb1b26AFEA1353467f98F79Bda100fbBC84F0a3C8'
export const USDT_ADDRESS = '0x2D3d1bcAE3F107F024C44B661a4298a712D1fcb9'
// TODO: fill actual USDC mock address when available
export const USDC_ADDRESS = '0x0000000000000000000000000000000000000000'

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

export async function payForOrderOnChain({ orderId, tokenSymbol, amount }) {
  const { signer } = await getProviderAndSigner()

  const tokenAddress = tokenSymbol === 'USDT' ? USDT_ADDRESS : USDC_ADDRESS
  if (tokenAddress === '0x0000000000000000000000000000000000000000') {
    throw new Error('USDC token address not configured in frontend yet')
  }

  // Instantiate payment contract
  const contract = new Contract(CONTRACT_ADDRESS, ecommerceAbi, signer)

  // From the UI we treat price as "whole tokens" and assume 18 decimals on mocks
  const amountWei = parseUnits(amount.toString(), 18)

  // Check balance & allowance on token
  const user = await signer.getAddress()
  const tokenContract = new Contract(tokenAddress, erc20Abi, signer)

  const balance = await tokenContract.balanceOf(user)
  if (balance < amountWei) {
    throw new Error('Insufficient token balance for this purchase')
  }

  const allowance = await tokenContract.allowance(user, CONTRACT_ADDRESS)
  if (allowance < amountWei) {
    const approveTx = await tokenContract.approve(CONTRACT_ADDRESS, amountWei)
    await approveTx.wait()
  }

  const tx = await contract.payForOrder(orderId, tokenAddress, amountWei)
  const receipt = await tx.wait()

  return {
    txHash: receipt.hash,
  }
}


