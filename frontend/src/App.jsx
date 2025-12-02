import { useEffect, useState } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import { fetchProducts, createOrder } from './api'
import { payForOrderOnChain } from './eth'
import Admin from './Admin'

function Home({ account, onConnect }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creatingOrder, setCreatingOrder] = useState(false)
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
    setCreatingOrder(true)
    try {
      // For now just call backend to create order; payment step will be wired next
      const res = await createOrder({
        buyer: account,
        productId: product.id,
        amount: product.price,
        token: selectedToken,
      })
      const { orderId } = res

      // Trigger on-chain payment via MetaMask
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
      setCreatingOrder(false)
    }
  }

  return (
    <main>
        {loading && <p>Loading products...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div className="token-switcher">
          <label>
            Pay with:
            <select
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
            >
              <option value="USDT">USDT</option>
              <option value="USDC">USDC</option>
            </select>
          </label>
        </div>

        <div className="products">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              {product.images && product.images[0] && (
                <img src={product.images[0]} alt={product.name} />
              )}
              <h2>{product.name}</h2>
              <p>{product.description}</p>
              <p>
                <strong>Price:</strong> {product.price} {selectedToken}
              </p>
              <button
                onClick={() => handleBuy(product)}
                disabled={creatingOrder}
              >
                {creatingOrder ? 'Processing...' : 'Buy'}
              </button>
            </div>
          ))}
          {!loading && !products.length && <p>No products found.</p>}
        </div>
      </main>
  )
}

function App() {
  const [account, setAccount] = useState('')
  const location = useLocation()

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask not found. Please install it to continue.')
      return
    }
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })
      setAccount(accounts[0])
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Ecommerce DApp</h1>
        <nav className="nav">
          <Link
            to="/"
            className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
          >
            Shop
          </Link>
          <Link
            to="/admin"
            className={
              location.pathname.startsWith('/admin') ? 'nav-link active' : 'nav-link'
            }
          >
            Admin
          </Link>
        </nav>
        <div>
          <button onClick={connectWallet}>
            {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
          </button>
        </div>
      </header>

      <Routes>
        <Route
          path="/"
          element={<Home account={account} onConnect={connectWallet} />}
        />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  )
}

export default App
