// src/components/forms/SaleForm.js
// Proper Sales Invoice Form with Line Items

import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAppContext } from '@/contexts/AppContext';

export default function SaleForm({ sale, onSave, onCancel }) {
  const { authFetch, currentBusiness, isSuperOwner, isViewingAllBusinesses, businesses } = useAppContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    customer: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    status: 'Paid',
    notes: '',
    paidAmount: '' // Add paid amount field
  });

  const [lineItems, setLineItems] = useState([
    { productId: '', productName: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);

  // Fetch products on mount
  useEffect(() => {
    async function fetchProducts() {
      try {
        let url = '/api/inventory';

        if (currentBusiness?.id) {
          // Specific business selected
          url += `?company_id=${currentBusiness.id}`;
        } else if (isSuperOwner && businesses.length > 0) {
          // Super owner viewing all - fetch from first business as default
          url += `?company_id=${businesses[0].id}`;
        } else {
          setLoading(false);
          return;
        }

        const res = await authFetch(url);
        const data = await res.json();
        if (data.success) {
          // Map inventory items to form format
          const mapped = data.data.map(item => ({
            id: item.id,
            name: item.name,
            unit: item.unit || 'Unit',
            price: Number(item.salePrice) || 0
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
  
  // Calculate paid amount and remaining
  const paidAmt = formData.paidAmount !== '' ? parseFloat(formData.paidAmount) || 0 : grandTotal;
  const remainingAmount = grandTotal - paidAmt;

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
            unitPrice: product.price,
            total: updated[index].quantity * product.price
          };
        }
      } else if (field === 'quantity') {
        const qty = parseFloat(value) || 0;
        updated[index] = {
          ...updated[index],
          quantity: qty,
          total: qty * updated[index].unitPrice
        };
      } else if (field === 'unitPrice') {
        const price = parseFloat(value) || 0;
        updated[index] = {
          ...updated[index],
          unitPrice: price,
          total: updated[index].quantity * price
        };
      }

      return updated;
    });
  };

  // Add new line item
  const addLineItem = () => {
    setLineItems(prev => [...prev, { productId: '', productName: '', quantity: 1, unitPrice: 0, total: 0 }]);
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

    // Validate at least one line item has a product
    const validItems = lineItems.filter(item => item.productId && item.quantity > 0);
    if (validItems.length === 0) {
      alert('Please add at least one product');
      return;
    }
    // Map items to API expected format (unitPrice -> price)
    const formattedItems = validItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.unitPrice  // API expects 'price', not 'unitPrice'
    }));

    onSave({
      ...formData,
      items: formattedItems,
      totalAmount: grandTotal,
      paidAmount: paidAmt // Include paid amount in submission
    });
  };

  if (loading) return <div className="p-4 text-center">Loading products...</div>;

  return (
    <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto">
      <div className="space-y-4">
        {/* Customer & Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Customer Name</label>
            <input
              type="text"
              name="customer"
              value={formData.customer}
              onChange={handleChange}
              required
              placeholder="Walk-in Customer"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Line Items Section */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Products / Items</span>
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
                          {product.name} (৳{product.price}/{product.unit})
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

                  {/* Unit Price */}
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Price</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => handleLineItemChange(index, 'unitPrice', e.target.value)}
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

        {/* Payment Details */}
        <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Payment Details</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit">Credit (Due)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Paid Amount</label>
              <input
                type="number"
                name="paidAmount"
                min="0"
                max={grandTotal}
                step="0.01"
                value={formData.paidAmount}
                onChange={handleChange}
                placeholder={`৳${grandTotal.toLocaleString()} (Full Amount)`}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">Leave empty for full payment</p>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-md p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-semibold">৳{grandTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Paid Amount:</span>
              <span className="font-semibold text-green-600">৳{paidAmt.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t">
              <span className="text-gray-600">Remaining:</span>
              <span className={`font-bold ${remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ৳{remainingAmount.toLocaleString()}
              </span>
            </div>
            {remainingAmount > 0 && (
              <p className="text-xs text-amber-600 mt-2">
                ⓘ A debtor entry will be created for the remaining amount
              </p>
            )}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
          <textarea
            name="notes"
            rows="2"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any additional notes..."
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
          Save Invoice
        </button>
      </div>
    </form>
  );
}