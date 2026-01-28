// src/components/forms/PurchaseOrderForm.js

import { useState, useEffect } from 'react';

export default function PurchaseOrderForm({ purchase, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    supplier: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    status: 'Unpaid'
  });

  useEffect(() => {
    if (purchase) {
      setFormData({
        supplier: purchase.supplier,
        date: new Date(purchase.date).toISOString().split('T')[0],
        amount: purchase.amount,
        status: purchase.status || 'Unpaid'
      });
    }
  }, [purchase]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Supplier Name</label>
          <input type="text" name="supplier" value={formData.supplier} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <input type="number" name="amount" value={formData.amount} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          </div>
        </div>
        <div>
             <label className="block text-sm font-medium text-gray-700">Status</label>
             <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                 <option value="Paid">Paid</option>
                 <option value="Unpaid">Unpaid</option>
                 <option value="Partial">Partial</option>
             </select>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50">Cancel</button>
        <button type="submit" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">Save</button>
      </div>
    </form>
  );
}