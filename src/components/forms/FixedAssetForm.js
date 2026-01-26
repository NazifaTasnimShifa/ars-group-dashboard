// src/components/forms/FixedAssetForm.js
import { useState, useEffect } from 'react';

export default function FixedAssetForm({ asset, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    acquisitionDate: new Date().toISOString().split('T')[0],
    cost: '',
    depreciation: '',
    bookValue: ''
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">Asset Name</label>
          <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600" placeholder="e.g., Delivery Truck" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
                <label htmlFor="acquisitionDate" className="block text-sm font-medium leading-6 text-gray-900">Acquisition Date</label>
                <input type="date" name="acquisitionDate" id="acquisitionDate" value={formData.acquisitionDate} onChange={handleChange} required className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"/>
            </div>
            <div>
                <label htmlFor="cost" className="block text-sm font-medium leading-6 text-gray-900">Acquisition Cost</label>
                <input type="number" name="cost" id="cost" value={formData.cost} onChange={handleChange} required className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600" placeholder="e.g., 3500000"/>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
                <label htmlFor="depreciation" className="block text-sm font-medium leading-6 text-gray-900">Depreciation (Yearly)</label>
                <input type="number" name="depreciation" id="depreciation" value={formData.depreciation} onChange={handleChange} required className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"/>
            </div>
            <div>
                <label htmlFor="bookValue" className="block text-sm font-medium leading-6 text-gray-900">Current Book Value</label>
                <input type="number" name="bookValue" id="bookValue" value={formData.bookValue} onChange={handleChange} required className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"/>
            </div>
        </div>
      </div>
      <div className="mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
        <button type="submit" className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:col-start-2">
          Save Asset
        </button>
        <button type="button" className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}