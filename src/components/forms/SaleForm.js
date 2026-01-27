// src/components/forms/SaleForm.js

import { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';

export default function SaleForm({ sale, onSave, onCancel }) {
  const { selectedCompany, token } = useAppContext();
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [customer, setCustomer] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      if (!selectedCompany) return;
      setLoadingProducts(true);
      try {
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch(`/api/inventory?company_id=${selectedCompany.id}`, { headers });
        const data = await res.json();
        // Handle different possible API responses
        if (data.success && Array.isArray(data.data)) {
          setProducts(data.data);
        } else if (Array.isArray(data)) {
          setProducts(data);
        } else if (data.data && Array.isArray(data.data)) {
          setProducts(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchProducts();
  }, [selectedCompany, token]);

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    if (field === 'quantity') {
      newItems[index][field] = parseInt(value) || 0;
    } else if (field === 'price') {
      newItems[index][field] = parseFloat(value) || 0;
    } else {
      newItems[index][field] = value;
    }

    if (field === 'productId') {
      const prod = products.find(p => p.id === value);
      if (prod) {
        newItems[index].price = parseFloat(prod.salePrice) || 0;
      }
    }
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (items.length === 0) {
      alert("Please add at least one item.");
      return;
    }
    // Validation: Check empty products
    if (items.some(i => !i.productId)) {
      alert("Please select a product for all items.");
      return;
    }
    onSave({ customer, date, items });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Customer Name</label>
        <input
          type="text"
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Walk-in Customer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-gray-900">Sale Items</h4>
          <button type="button" onClick={addItem} className="text-sm text-indigo-600 hover:text-indigo-900">+ Add Item</button>
        </div>

        {loadingProducts ? <p className="text-sm text-gray-500">Loading products...</p> : (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-end bg-gray-50 p-2 rounded">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500">Product</label>
                  <select
                    value={item.productId}
                    onChange={(e) => updateItem(index, 'productId', e.target.value)}
                    className="block w-full rounded border-gray-300 sm:text-sm"
                    required
                  >
                    <option value="">Select...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                    ))}
                  </select>
                </div>
                <div className="w-20">
                  <label className="block text-xs text-gray-500">Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    className="block w-full rounded border-gray-300 sm:text-sm"
                    required
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs text-gray-500">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => updateItem(index, 'price', e.target.value)}
                    className="block w-full rounded border-gray-300 sm:text-sm"
                    required
                  />
                </div>
                <div className="w-24 text-right">
                  <span className="text-sm font-medium block h-9 leading-9">
                    ৳{(item.quantity * item.price).toFixed(2)}
                  </span>
                </div>
                <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 mb-2">
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-2 border-t">
        <span className="text-lg font-bold">Total: ৳{calculateTotal().toFixed(2)}</span>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Cancel</button>
        <button type="submit" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">Save Sale</button>
      </div>
    </form>
  );
}