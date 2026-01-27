// src/components/forms/FixedAssetForm.js

import { useState, useEffect } from 'react';

export default function FixedAssetForm({ asset, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '', acquisitionDate: new Date().toISOString().split('T')[0], cost: '', depreciation: 0, bookValue: ''
  });

  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name,
        acquisitionDate: new Date(asset.acquisitionDate).toISOString().split('T')[0],
        cost: asset.cost,
        depreciation: asset.depreciation || 0,
        bookValue: asset.bookValue || asset.cost
      });
    }
  }, [asset]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Asset Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Acquisition Date</label>
                <input type="date" name="acquisitionDate" value={formData.acquisitionDate} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Cost</label>
                <input type="number" name="cost" value={formData.cost} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"/>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Depreciation</label>
                <input type="number" name="depreciation" value={formData.depreciation} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Book Value</label>
                <input type="number" name="bookValue" value={formData.bookValue} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"/>
            </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50">Cancel</button>
        <button type="submit" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">Save Asset</button>
      </div>
    </form>
  );
}