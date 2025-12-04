import { useState } from 'react'
import { addProduct } from './api'

function Admin() {

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    stock: '',
    category: '',
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {

    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {

      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        images: form.image ? [form.image] : [],
        stock: Number(form.stock),
        category: form.category,
        variants: [],
      }

      await addProduct(payload)

      setMessage('Product added successfully')

      setForm({
        name: '',
        description: '',
        price: '',
        image: '',
        stock: '',
        category: '',
      })
    } catch (err) {
      setMessage(err.message || 'Failed to add product')
    } finally {
      setLoading(false)
    }

  }

  return (

    <div className="admin">

      <h2>Admin Panel</h2>

      <p style={{ marginBottom: '1rem', color: '#9ca3af' }}>
        Create new products that will appear on the main shop page.
      </p>

      <form className="admin-form" onSubmit={handleSubmit}>

        <div className="field">
          <label>Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field">
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="field-inline">
          <div className="field">
            <label>Price (token units)</label>
            <input
              name="price"
              type="number"
              step="0.0001"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label>Stock</label>
            <input
              name="stock"
              type="number"
              value={form.stock}
              onChange={handleChange}
              required
            />
          </div>

        </div>
        <div className="field">
          <label>Image URL</label>
          <input
            name="image"
            value={form.image}
            onChange={handleChange}
          />
        </div>
        <div className="field">
          <label>Category</label>
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Add Product'}
        </button>

        {message && (
          <p style={{ marginTop: '0.75rem', color: '#e5e7eb' }}>{message}</p>
        )}

      </form>
    </div>
  )
}

export default Admin


