// src/components/forms/SaleForm.js
import { useState, useEffect } from 'react';

export default function SaleForm({ sale, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    customer: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    status: 'Unpaid'
  });

  useEffect(() => {
    if (sale) {
      setFormData({
        customer: sale.customer,
        date: new Date(sale.date).toISOString().split('T')[0],
        amount: sale.amount,
        status: sale.status || 'Unpaid'
      });
    }
  }, [sale]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="customer" className="block text-sm font-medium leading-6 text-gray-900">Customer Name</label>
          <input type="text" name="customer" id="customer" value={formData.customer} onChange={handleChange} required className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
             <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-900">Date</label>
                <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} required className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300" />
             </div>
             <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-900">Amount</label>
                <input type="number" name="amount" id="amount" value={formData.amount} onChange={handleChange} required className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300" />
             </div>
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
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Cancel</button>
        <button type="submit" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">Save Sale</button>
      </div>
    </form>
  );
}