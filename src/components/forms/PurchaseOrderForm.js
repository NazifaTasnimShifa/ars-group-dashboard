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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="supplier" className="block text-sm font-medium leading-6 text-gray-900">Supplier Name</label>
            <input type="text" name="supplier" id="supplier" value={formData.supplier} onChange={handleChange} required className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600" placeholder="e.g., Beximco LPG Unit" />
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium leading-6 text-gray-900">Purchase Date</label>
            <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} required className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600" />
          </div>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium leading-6 text-gray-900">Total Amount</label>
          <input type="number" name="amount" id="amount" value={formData.amount} onChange={handleChange} required className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600" placeholder="e.g., 1100000" />
        </div>

        <div>
             <label htmlFor="status" className="block text-sm font-medium text-gray-900">Status</label>
             <select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600">
                 <option value="Paid">Paid</option>
                 <option value="Unpaid">Unpaid</option>
                 <option value="Partial">Partial</option>
             </select>
        </div>

      </div>
      <div className="mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
        <button type="submit" className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:col-start-2">
          Save Purchase Order
        </button>
        <button type="button" className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}