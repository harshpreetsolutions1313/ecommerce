import { useEffect, useState } from 'react'
import { fetchProducts, createOrder } from '../api'
import { payForOrderOnChain } from '../eth'
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

      const res = await createOrder({
        buyer: account,
        productId: product.id,
        amount: product.price,
        token: selectedToken,
      })

      const { orderId } = res

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


