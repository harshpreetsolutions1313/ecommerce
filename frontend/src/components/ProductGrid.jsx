function ProductGrid({
  products,
  selectedToken,
  processingProductId,
  onBuy,
  loading,
}) {
  return (
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
            onClick={() => onBuy(product)}
            disabled={processingProductId === product.id}
          >
            {processingProductId === product.id ? 'Processing...' : 'Buy'}
          </button>
        </div>
      ))}
      {!loading && !products.length && <p>No products found.</p>}
    </div>
  )
}

export default ProductGrid


