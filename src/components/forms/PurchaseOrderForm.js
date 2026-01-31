// src/components/forms/PurchaseOrderForm.js
// Enhanced Purchase Order Form with Line Items and Product Selection

import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAppContext } from '@/contexts/AppContext';

export default function PurchaseOrderForm({ purchase, onSave, onCancel }) {
  const { authFetch, currentBusiness, isSuperOwner, businesses } = useAppContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    supplier: '',
    date: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    status: 'Unpaid',
    notes: ''
  });

  const [lineItems, setLineItems] = useState([
    { productId: '', productName: '', quantity: 1, unitCost: 0, total: 0 }
  ]);

  // Fetch products on mount to allow selecting items to restock
  useEffect(() => {
    async function fetchProducts() {
      try {
        let url = '/api/inventory';
        
        if (currentBusiness?.id) {
          url += `?company_id=${currentBusiness.id}`;
        } else if (isSuperOwner && businesses.length > 0) {
          url += `?company_id=${businesses[0].id}`;
        } else {
          setLoading(false);
          return;
        }
        
        const res = await authFetch(url);
        const data = await res.json();
        if (data.success) {
          // Map inventory items
          const mapped = data.data.map(item => ({
            id: item.id,
            name: item.name,
            unit: item.unit || 'Unit',
            // Default to current cost price
            costPrice: Number(item.costPrice) || 0
          }));
          setProducts(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [authFetch, currentBusiness, isSuperOwner, businesses]);

  // Calculate grand total
  const grandTotal = lineItems.reduce((sum, item) => sum + (item.total || 0), 0);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle line item changes
  const handleLineItemChange = (index, field, value) => {
    setLineItems(prev => {
      const updated = [...prev];

      if (field === 'productId') {
        const product = products.find(p => p.id === value);
        if (product) {
          updated[index] = {
            ...updated[index],
            productId: value,
            productName: product.name,
            unitCost: product.costPrice, // Default to known cost price
            total: updated[index].quantity * product.costPrice
          };
        }
      } else if (field === 'quantity') {
        const qty = parseFloat(value) || 0;
        updated[index] = {
          ...updated[index],
          quantity: qty,
          total: qty * updated[index].unitCost
        };
      } else if (field === 'unitCost') {
        const cost = parseFloat(value) || 0;
        updated[index] = {
          ...updated[index],
          unitCost: cost,
          total: updated[index].quantity * cost
        };
      }

      return updated;
    });
  };

  // Add new line item
  const addLineItem = () => {
    setLineItems(prev => [...prev, { productId: '', productName: '', quantity: 1, unitCost: 0, total: 0 }]);
  };

  // Remove line item
  const removeLineItem = (index) => {
    if (lineItems.length > 1) {
      setLineItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate
    const validItems = lineItems.filter(item => item.productId && item.quantity > 0);
    if (validItems.length === 0) {
      alert('Please add at least one product to order');
      return;
    }

    onSave({
      ...formData,
      items: validItems,
      amount: grandTotal // Map total to 'amount' field expected by API
    });
  };

  if (loading) return <div className="p-4 text-center">Loading products...</div>;

  return (
    <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto">
      <div className="space-y-4">
        {/* Supplier & Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Supplier Name</label>
            <input
              type="text"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              required
              placeholder="Supplier Name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Reference Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Reference / Bill No. (Optional)</label>
          <input
            type="text"
            name="referenceNumber"
            value={formData.referenceNumber}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        {/* Line Items Section */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Items to Order</span>
            <button
              type="button"
              onClick={addLineItem}
              className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Item
            </button>
          </div>

          <div className="divide-y">
            {lineItems.map((item, index) => (
              <div key={index} className="p-3 bg-white">
                <div className="grid grid-cols-12 gap-2 items-end">
                  {/* Product Select */}
                  <div className="col-span-5">
                    <label className="block text-xs text-gray-500 mb-1">Product</label>
                    <select
                      value={item.productId}
                      onChange={(e) => handleLineItemChange(index, 'productId', e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    >
                      <option value="">Select product...</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} (Current Cost: ৳{product.costPrice})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Qty</label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    />
                  </div>

                  {/* Unit Cost */}
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Unit Cost</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitCost}
                      onChange={(e) => handleLineItemChange(index, 'unitCost', e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    />
                  </div>

                  {/* Line Total */}
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Total</label>
                    <div className="px-3 py-2 bg-gray-50 rounded-md text-sm font-medium text-gray-900">
                      ৳{item.total.toLocaleString()}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <div className="col-span-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      disabled={lineItems.length === 1}
                      className="p-2 text-red-500 hover:text-red-700 disabled:text-gray-300"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Grand Total */}
          <div className="bg-gray-50 px-4 py-3 border-t flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Grand Total</span>
            <span className="text-xl font-bold text-indigo-600">৳{grandTotal.toLocaleString()}</span>
          </div>
        </div>

        {/* Status & Notes */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Partial">Partial</option>
            </select>
          </div>
          <div>
            {/* Placeholder for future expansion (e.g., Payment Method) */}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
          <textarea
            name="notes"
            rows="2"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Delivery instructions..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="mt-6 flex justify-end gap-3 border-t pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          Create Order
        </button>
      </div>
    </form>
  );
}