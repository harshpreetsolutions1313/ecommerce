export const API_BASE_URL = 'http://localhost:5000/api';

export async function fetchProducts() {
  const res = await fetch(`${API_BASE_URL}/products`);
  if (!res.ok) {
    throw new Error('Failed to load products');
  }
  return res.json();
}

export async function createOrder({ buyer, productId, amount, token }) {
  const res = await fetch(`${API_BASE_URL}/orders/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ buyer, productId, amount, token }),
  });
  if (!res.ok) {
    throw new Error('Failed to create order');
  }
  return res.json(); // { orderId }
}

export async function addProduct(product) {
  const res = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  if (!res.ok) {
    throw new Error('Failed to add product');
  }
  return res.json();
}


