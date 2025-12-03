import { useEffect, useState } from 'react'
import { fetchProducts, createOrder } from '../api'
import { createOrderOnChain, payForOrderOnChain } from '../eth'
import TokenSelector from '../components/TokenSelector'
import ProductGrid from '../components/ProductGrid'

function Shop({ account, onConnect }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processingProductId, setProcessingProductId] = useState('')
  const [selectedToken, setSelectedToken] = useState('USDT')

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchProducts()
        setProducts(data)
      } catch (err) {
        setError(err.message || 'Failed to load products')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleBuy = async (product) => {

    if (!account) {
      await onConnect()
      if (!account) return
    }

    setProcessingProductId(product.id)

    try {
      // 1) Create order on-chain using connected wallet
      const { orderId } = await createOrderOnChain({
        buyer: account,
        productId: product.id,
        amount: product.price,
      })

      // 2) Persist order in backend DB
      await createOrder({
        orderId,
        buyer: account,
        productId: product.id,
        amount: product.price,
        token: selectedToken,
      })

      // 3) Pay for order on-chain with selected token
      const payResult = await payForOrderOnChain({
        orderId,
        tokenSymbol: selectedToken,
        amount: product.price,
      })

      alert(
        `Payment tx submitted!\nOrder ID: ${orderId}\nTx hash: ${payResult.txHash}`,
      )
      
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to create order')
    } finally {
      setProcessingProductId('')
    }
  }

  return (
    <main>
      {loading && <p>Loading products...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <TokenSelector
        selectedToken={selectedToken}
        onChange={setSelectedToken}
      />

      <ProductGrid
        products={products}
        selectedToken={selectedToken}
        processingProductId={processingProductId}
        onBuy={handleBuy}
        loading={loading}
      />
    </main>
  )
}

export default Shop


