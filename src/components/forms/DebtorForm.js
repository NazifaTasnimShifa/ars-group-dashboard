// src/components/forms/DebtorForm.js
import { useState, useEffect } from 'react';

export default function DebtorForm({ debtor, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    amount: '',
    due: '',
    aging: 0
  });

  useEffect(() => {
    if (debtor) {
      // Populate form if editing
      setFormData({
        name: debtor.name,
        contactPerson: debtor.contactPerson || '',
        email: debtor.email || '',
        phone: debtor.phone || '',
        amount: debtor.amount,
        due: debtor.due ? new Date(debtor.due).toISOString().split('T')[0] : '',
        aging: debtor.aging
      });
    }
  }, [debtor]);

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
          <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">Debtor Name</label>
          <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-indigo-600" />
        </div>
        {/* ... Other fields similarly linked to state ... */}
        <div className="grid grid-cols-2 gap-4">
             <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-900">Amount</label>
                <input type="number" name="amount" value={formData.amount} onChange={handleChange} required className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300" />
             </div>
             <div>
                <label htmlFor="due" className="block text-sm font-medium text-gray-900">Due Date</label>
                <input type="date" name="due" value={formData.due} onChange={handleChange} required className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300" />
             </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Cancel</button>
        <button type="submit" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">Save</button>
      </div>
    </form>
  );
}