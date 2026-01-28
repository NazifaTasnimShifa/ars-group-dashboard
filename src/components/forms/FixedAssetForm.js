// src/components/forms/FixedAssetForm.js
// Enhanced Fixed Asset Form with Depreciation Method and Useful Life

import { useState, useEffect } from 'react';

const ASSET_CATEGORIES = [
  { value: 'LAND', label: 'Land' },
  { value: 'BUILDING', label: 'Building' },
  { value: 'PLANT_MACHINERY', label: 'Plant & Machinery' },
  { value: 'VEHICLE', label: 'Vehicle' },
  { value: 'FURNITURE', label: 'Furniture & Fixtures' },
  { value: 'COMPUTER', label: 'Computer & IT Equipment' },
  { value: 'OTHER', label: 'Other' }
];

const DEPRECIATION_METHODS = [
  { value: 'STRAIGHT_LINE', label: 'Straight Line Method (SLM)', description: 'Equal depreciation each year' },
  { value: 'WRITTEN_DOWN_VALUE', label: 'Written Down Value (WDV)', description: 'Fixed percentage of book value' },
  { value: 'SUM_OF_YEARS', label: 'Sum of Years Digits', description: 'Accelerated depreciation' }
];

export default function FixedAssetForm({ asset, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'OTHER',
    acquisitionDate: new Date().toISOString().split('T')[0],
    cost: '',
    usefulLifeYears: 5,
    depreciationMethod: 'STRAIGHT_LINE',
    depreciationRate: 20,
    depreciation: 0,
    bookValue: '',
    location: '',
    notes: ''
  });

  // Auto-calculate depreciation rate and book value
  useEffect(() => {
    if (formData.cost && formData.usefulLifeYears && formData.depreciationMethod) {
      const cost = parseFloat(formData.cost) || 0;
      const years = parseInt(formData.usefulLifeYears) || 1;

      // Calculate depreciation rate based on method
      let rate = 0;
      if (formData.depreciationMethod === 'STRAIGHT_LINE') {
        rate = 100 / years;
      } else if (formData.depreciationMethod === 'WRITTEN_DOWN_VALUE') {
        // WDV commonly uses 1.5x to 2x the SLM rate
        rate = (100 / years) * 1.5;
      } else {
        rate = 100 / years;
      }

      // Calculate book value
      const depreciation = parseFloat(formData.depreciation) || 0;
      const bookValue = cost - depreciation;

      setFormData(prev => ({
        ...prev,
        depreciationRate: Math.round(rate * 100) / 100,
        bookValue: bookValue > 0 ? bookValue : 0
      }));
    }
  }, [formData.cost, formData.usefulLifeYears, formData.depreciationMethod, formData.depreciation]);

  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name || '',
        category: asset.category || 'OTHER',
        acquisitionDate: asset.acquisitionDate ? new Date(asset.acquisitionDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        cost: asset.cost || '',
        usefulLifeYears: asset.usefulLifeYears || 5,
        depreciationMethod: asset.depreciationMethod || 'STRAIGHT_LINE',
        depreciationRate: asset.depreciationRate || 20,
        depreciation: asset.depreciation || 0,
        bookValue: asset.bookValue || asset.cost || '',
        location: asset.location || '',
        notes: asset.notes || ''
      });
    }
  }, [asset]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.cost) {
      alert('Asset name and cost are required');
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto">
      <div className="space-y-4">
        {/* Asset Name & Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Asset Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Delivery Truck"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {ASSET_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Acquisition Date & Cost */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Acquisition Date *</label>
            <input
              type="date"
              name="acquisitionDate"
              value={formData.acquisitionDate}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Acquisition Cost *</label>
            <input
              type="number"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Depreciation Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Depreciation Method</label>
          <select
            name="depreciationMethod"
            value={formData.depreciationMethod}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {DEPRECIATION_METHODS.map(method => (
              <option key={method.value} value={method.value}>{method.label}</option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            {DEPRECIATION_METHODS.find(m => m.value === formData.depreciationMethod)?.description}
          </p>
        </div>

        {/* Useful Life & Depreciation Rate */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Useful Life (Years)</label>
            <input
              type="number"
              name="usefulLifeYears"
              value={formData.usefulLifeYears}
              onChange={handleChange}
              min="1"
              max="100"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Depreciation Rate (%)</label>
            <input
              type="number"
              name="depreciationRate"
              value={formData.depreciationRate}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Accumulated Depreciation & Book Value */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Accumulated Depreciation</label>
            <input
              type="number"
              name="depreciation"
              value={formData.depreciation}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Book Value</label>
            <div className="mt-1 px-3 py-2 bg-gray-50 rounded-md text-sm font-medium text-indigo-600">
              ৳{parseFloat(formData.bookValue || 0).toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-gray-500">Auto-calculated: Cost - Depreciation</p>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., Main Office, Branch A"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
          <textarea
            name="notes"
            rows="2"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any additional notes about this asset..."
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
          Save Asset
        </button>
      </div>
    </form>
  );
}