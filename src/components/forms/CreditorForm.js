// src/components/forms/CreditorForm.js

import { useState, useEffect } from 'react';

export default function CreditorForm({ creditor, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '', contactPerson: '', amount: '', due: '', aging: 0
  });

  useEffect(() => {
    if (creditor) {
      setFormData({
        name: creditor.name,
        contactPerson: creditor.contactPerson || '',
        amount: creditor.amount,
        due: creditor.due ? new Date(creditor.due).toISOString().split('T')[0] : '',
        aging: creditor.aging || 0
      });
    }
  }, [creditor]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Creditor Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount Due</label>
            <input type="number" name="amount" value={formData.amount} onChange={handleChange} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Due Date</label>
            <input type="date" name="due" value={formData.due} onChange={handleChange} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm sm:text-sm" />
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50">Cancel</button>
        <button type="submit" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">Save</button>
      </div>
    </form>
  );
}