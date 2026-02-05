// src/pages/pump/config.js
// ARS Corporation - Pump Configuration Page

import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  Cog6ToothIcon,
  BeakerIcon,
  BuildingOfficeIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

// Tab definitions
const tabs = [
  { id: 'fuel-types', name: 'Fuel Types', icon: BeakerIcon },
  { id: 'branches', name: 'Branches', icon: BuildingOfficeIcon },
  { id: 'tanks', name: 'Storage Tanks', icon: CubeIcon },
  { id: 'pumps', name: 'Pumps & Nozzles', icon: Cog6ToothIcon },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Modal component
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500/75" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function PumpConfigPage() {
  const { authFetch, currentBusiness } = useAppContext();
  const [activeTab, setActiveTab] = useState('fuel-types');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Data states
  const [fuelTypes, setFuelTypes] = useState([]);
  const [branches, setBranches] = useState([]);
  const [tanks, setTanks] = useState([]);
  const [pumps, setPumps] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editItem, setEditItem] = useState(null);

  // Form states
  const [formData, setFormData] = useState({});

  // Fetch data based on active tab
  const fetchData = useCallback(async () => {
    if (!currentBusiness?.id) return;
    
    setLoading(true);
    try {
      if (activeTab === 'fuel-types') {
        const res = await authFetch(`/api/pump/config/fuel-types?company_id=${currentBusiness.id}`);
        const result = await res.json();
        if (result.success) setFuelTypes(result.data);
      } else if (activeTab === 'branches') {
        const res = await authFetch(`/api/pump/config/branches?company_id=${currentBusiness.id}`);
        const result = await res.json();
        if (result.success) setBranches(result.data);
      } else if (activeTab === 'tanks') {
        let url = `/api/pump/config/tanks?company_id=${currentBusiness.id}`;
        if (selectedBranch) url += `&branch_id=${selectedBranch}`;
        const res = await authFetch(url);
        const result = await res.json();
        if (result.success) setTanks(result.data);
      } else if (activeTab === 'pumps') {
        let url = `/api/pump/config/pumps?company_id=${currentBusiness.id}`;
        if (selectedBranch) url += `&branch_id=${selectedBranch}`;
        const res = await authFetch(url);
        const result = await res.json();
        if (result.success) setPumps(result.data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setMessage({ type: 'error', text: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  }, [authFetch, currentBusiness?.id, activeTab, selectedBranch]);

  // Also fetch branches for tanks/pumps tabs
  const fetchBranches = useCallback(async () => {
    if (!currentBusiness?.id) return;
    try {
      const res = await authFetch(`/api/pump/config/branches?company_id=${currentBusiness.id}`);
      const result = await res.json();
      if (result.success) setBranches(result.data);
    } catch (err) {
      console.error('Fetch branches error:', err);
    }
  }, [authFetch, currentBusiness?.id]);

  // Fetch fuel types for tanks/pumps forms
  const fetchFuelTypes = useCallback(async () => {
    if (!currentBusiness?.id) return;
    try {
      const res = await authFetch(`/api/pump/config/fuel-types?company_id=${currentBusiness.id}`);
      const result = await res.json();
      if (result.success) setFuelTypes(result.data);
    } catch (err) {
      console.error('Fetch fuel types error:', err);
    }
  }, [authFetch, currentBusiness?.id]);

  useEffect(() => {
    fetchData();
    if (activeTab === 'tanks' || activeTab === 'pumps') {
      fetchBranches();
      fetchFuelTypes();
    }
  }, [fetchData, activeTab, fetchBranches, fetchFuelTypes]);

  // Open modal for add/edit
  const openModal = (type, item = null) => {
    setModalType(type);
    setEditItem(item);
    setFormData(item || {});
    setModalOpen(true);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      let url, method, body;
      
      if (modalType === 'fuel-type') {
        url = `/api/pump/config/fuel-types?company_id=${currentBusiness.id}`;
        method = editItem ? 'PUT' : 'POST';
        body = { ...formData };
        if (editItem) body.id = editItem.id;
      } else if (modalType === 'branch') {
        url = `/api/pump/config/branches?company_id=${currentBusiness.id}`;
        method = editItem ? 'PUT' : 'POST';
        body = { ...formData };
        if (editItem) body.id = editItem.id;
      } else if (modalType === 'tank') {
        url = `/api/pump/config/tanks?company_id=${currentBusiness.id}`;
        method = editItem ? 'PUT' : 'POST';
        body = { ...formData };
        if (editItem) body.id = editItem.id;
      } else if (modalType === 'pump') {
        url = `/api/pump/config/pumps?company_id=${currentBusiness.id}`;
        method = editItem ? 'PUT' : 'POST';
        body = { ...formData };
        if (editItem) body.id = editItem.id;
      }

      const res = await authFetch(url, {
        method,
        body: JSON.stringify(body)
      });
      const result = await res.json();

      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Saved successfully' });
        setModalOpen(false);
        fetchData();
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to save' });
      }
    } catch (err) {
      console.error('Submit error:', err);
      setMessage({ type: 'error', text: 'Failed to save' });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (type, id) => {
    if (!confirm('Are you sure you want to deactivate this item?')) return;
    
    try {
      let url;
      if (type === 'fuel-type') {
        url = `/api/pump/config/fuel-types?company_id=${currentBusiness.id}&id=${id}`;
      } else if (type === 'branch') {
        url = `/api/pump/config/branches?company_id=${currentBusiness.id}&id=${id}`;
      } else if (type === 'tank') {
        url = `/api/pump/config/tanks?company_id=${currentBusiness.id}&id=${id}`;
      } else if (type === 'pump') {
        url = `/api/pump/config/pumps?company_id=${currentBusiness.id}&id=${id}`;
      }

      const res = await authFetch(url, { method: 'DELETE' });
      const result = await res.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Deactivated successfully' });
        fetchData();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (err) {
      console.error('Delete error:', err);
      setMessage({ type: 'error', text: 'Failed to deactivate' });
    }
  };

  // Render fuel types tab
  const renderFuelTypesTab = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Fuel Types</h3>
        <button
          onClick={() => openModal('fuel-type')}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Fuel Type
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price (৳/L)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {fuelTypes.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  No fuel types configured. Click "Add Fuel Type" to create one.
                </td>
              </tr>
            ) : (
              fuelTypes.map((ft) => (
                <tr key={ft.id}>
                  <td className="px-6 py-4 font-medium text-gray-900">{ft.name}</td>
                  <td className="px-6 py-4 text-gray-500">{ft.code}</td>
                  <td className="px-6 py-4 text-gray-900">৳{ft.currentPrice?.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${ft.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {ft.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => openModal('fuel-type', ft)} className="text-indigo-600 hover:text-indigo-900">
                      <PencilIcon className="h-5 w-5 inline" />
                    </button>
                    <button onClick={() => handleDelete('fuel-type', ft.id)} className="text-red-600 hover:text-red-900">
                      <TrashIcon className="h-5 w-5 inline" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render branches tab
  const renderBranchesTab = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Branches / Locations</h3>
        <button
          onClick={() => openModal('branch')}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Branch
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pumps</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanks</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {branches.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No branches configured. Click "Add Branch" to create one.
                </td>
              </tr>
            ) : (
              branches.map((b) => (
                <tr key={b.id}>
                  <td className="px-6 py-4 font-mono text-gray-500">{b.code}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{b.name}</td>
                  <td className="px-6 py-4 text-gray-600">{b.pumpCount || 0}</td>
                  <td className="px-6 py-4 text-gray-600">{b.tankCount || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {b.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => openModal('branch', b)} className="text-indigo-600 hover:text-indigo-900">
                      <PencilIcon className="h-5 w-5 inline" />
                    </button>
                    <button onClick={() => handleDelete('branch', b.id)} className="text-red-600 hover:text-red-900">
                      <TrashIcon className="h-5 w-5 inline" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render tanks tab
  const renderTanksTab = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="rounded-md border-gray-300 text-sm py-2 px-3"
        >
          <option value="">All Branches</option>
          {branches.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Underground Storage Tanks</h3>
          <button
            onClick={() => openModal('tank')}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
            disabled={branches.length === 0 || fuelTypes.length === 0}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Tank
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tank #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fuel Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity (L)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock (L)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tanks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    {branches.length === 0 
                      ? 'Please add a branch first before adding tanks.'
                      : fuelTypes.length === 0
                        ? 'Please add fuel types first before adding tanks.'
                        : 'No tanks configured. Click "Add Tank" to create one.'}
                  </td>
                </tr>
              ) : (
                tanks.map((t) => (
                  <tr key={t.id}>
                    <td className="px-6 py-4 font-medium text-gray-900">{t.tankNumber}</td>
                    <td className="px-6 py-4 text-gray-600">{t.branchName}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                        {t.fuelTypeName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{t.capacityLiters?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-900">{t.currentStock?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => openModal('tank', t)} className="text-indigo-600 hover:text-indigo-900">
                        <PencilIcon className="h-5 w-5 inline" />
                      </button>
                      <button onClick={() => handleDelete('tank', t.id)} className="text-red-600 hover:text-red-900">
                        <TrashIcon className="h-5 w-5 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render pumps tab
  const renderPumpsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="rounded-md border-gray-300 text-sm py-2 px-3"
        >
          <option value="">All Branches</option>
          {branches.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Pumps & Nozzles</h3>
          <button
            onClick={() => openModal('pump')}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
            disabled={branches.length === 0 || tanks.length === 0}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Pump
          </button>
        </div>
        
        {pumps.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            {branches.length === 0 
              ? 'Please add a branch first.'
              : tanks.length === 0
                ? 'Please add storage tanks first.'
                : 'No pumps configured. Click "Add Pump" to create one.'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {pumps.map((pump) => (
              <div key={pump.id} className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-gray-900">Pump {pump.pumpNumber}</span>
                    <span className="text-sm text-gray-500">{pump.branchName}</span>
                    {pump.isMpu && (
                      <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">MPU</span>
                    )}
                  </div>
                  <div className="space-x-2">
                    <button onClick={() => openModal('pump', pump)} className="text-indigo-600 hover:text-indigo-900">
                      <PencilIcon className="h-5 w-5 inline" />
                    </button>
                    <button onClick={() => handleDelete('pump', pump.id)} className="text-red-600 hover:text-red-900">
                      <TrashIcon className="h-5 w-5 inline" />
                    </button>
                  </div>
                </div>
                
                {pump.nozzles && pump.nozzles.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <table className="min-w-full">
                      <thead>
                        <tr className="text-xs text-gray-500 uppercase">
                          <th className="text-left py-2">Nozzle</th>
                          <th className="text-left py-2">Fuel Type</th>
                          <th className="text-left py-2">Tank</th>
                          <th className="text-left py-2">Current Reading</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {pump.nozzles.map((nozzle) => (
                          <tr key={nozzle.id}>
                            <td className="py-2 font-medium">{nozzle.nozzleNumber}</td>
                            <td className="py-2">
                              <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700">
                                {nozzle.fuelTypeName}
                              </span>
                            </td>
                            <td className="py-2 text-gray-600">{nozzle.tankNumber}</td>
                            <td className="py-2 font-mono">{nozzle.currentMeterReading?.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No nozzles configured for this pump.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Render modal form based on type
  const renderModalForm = () => {
    if (modalType === 'fuel-type') {
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-md border-gray-300"
              placeholder="e.g., Petrol, Diesel, Octane"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
            <input
              type="text"
              value={formData.code || ''}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full rounded-md border-gray-300"
              placeholder="e.g., PTL, DSL, OCT"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Price (৳/L)</label>
            <input
              type="number"
              step="0.01"
              value={formData.currentPrice || ''}
              onChange={(e) => setFormData({ ...formData, currentPrice: parseFloat(e.target.value) })}
              className="w-full rounded-md border-gray-300"
              placeholder="e.g., 130.50"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      );
    }

    if (modalType === 'branch') {
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
            <input
              type="text"
              value={formData.code || ''}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full rounded-md border-gray-300"
              placeholder="e.g., BR01"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-md border-gray-300"
              placeholder="e.g., Main Branch"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full rounded-md border-gray-300"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full rounded-md border-gray-300"
              placeholder="Optional"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      );
    }

    if (modalType === 'tank') {
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
            <select
              value={formData.branchId || ''}
              onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
              className="w-full rounded-md border-gray-300"
              required
              disabled={!!editItem}
            >
              <option value="">Select Branch</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tank Number</label>
            <input
              type="text"
              value={formData.tankNumber || ''}
              onChange={(e) => setFormData({ ...formData, tankNumber: e.target.value })}
              className="w-full rounded-md border-gray-300"
              placeholder="e.g., T1, Tank-01"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
            <select
              value={formData.fuelTypeId || ''}
              onChange={(e) => setFormData({ ...formData, fuelTypeId: e.target.value })}
              className="w-full rounded-md border-gray-300"
              required
            >
              <option value="">Select Fuel Type</option>
              {fuelTypes.filter(ft => ft.isActive).map(ft => (
                <option key={ft.id} value={ft.id}>{ft.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (Liters)</label>
            <input
              type="number"
              value={formData.capacityLiters || ''}
              onChange={(e) => setFormData({ ...formData, capacityLiters: parseFloat(e.target.value) })}
              className="w-full rounded-md border-gray-300"
              placeholder="e.g., 20000"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {editItem ? 'Current Stock (Liters)' : 'Initial Stock (Liters)'}
            </label>
            <input
              type="number"
              value={editItem ? (formData.currentStock || '') : (formData.initialStock || '')}
              onChange={(e) => setFormData({ 
                ...formData, 
                [editItem ? 'currentStock' : 'initialStock']: parseFloat(e.target.value) 
              })}
              className="w-full rounded-md border-gray-300"
              placeholder="e.g., 5000"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      );
    }

    if (modalType === 'pump') {
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
            <select
              value={formData.branchId || ''}
              onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
              className="w-full rounded-md border-gray-300"
              required
              disabled={!!editItem}
            >
              <option value="">Select Branch</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pump Number</label>
            <input
              type="text"
              value={formData.pumpNumber || ''}
              onChange={(e) => setFormData({ ...formData, pumpNumber: e.target.value })}
              className="w-full rounded-md border-gray-300"
              placeholder="e.g., P1, Pump-01"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isMpu"
              checked={formData.isMpu || false}
              onChange={(e) => setFormData({ ...formData, isMpu: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="isMpu" className="text-sm text-gray-700">Multi-Product Unit (MPU)</label>
          </div>
          
          {!editItem && (
            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Add Nozzle</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Nozzle Number</label>
                  <input
                    type="text"
                    value={formData.nozzles?.[0]?.nozzleNumber || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      nozzles: [{ ...formData.nozzles?.[0], nozzleNumber: e.target.value }]
                    })}
                    className="w-full rounded-md border-gray-300 text-sm"
                    placeholder="e.g., N1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Fuel Type</label>
                    <select
                      value={formData.nozzles?.[0]?.fuelTypeId || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        nozzles: [{ ...formData.nozzles?.[0], fuelTypeId: e.target.value }]
                      })}
                      className="w-full rounded-md border-gray-300 text-sm"
                    >
                      <option value="">Select</option>
                      {fuelTypes.filter(ft => ft.isActive).map(ft => (
                        <option key={ft.id} value={ft.id}>{ft.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Tank</label>
                    <select
                      value={formData.nozzles?.[0]?.tankId || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        nozzles: [{ ...formData.nozzles?.[0], tankId: e.target.value }]
                      })}
                      className="w-full rounded-md border-gray-300 text-sm"
                    >
                      <option value="">Select</option>
                      {tanks.filter(t => t.branchId === formData.branchId).map(t => (
                        <option key={t.id} value={t.id}>{t.tankNumber} ({t.fuelTypeName})</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Opening Reading</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.nozzles?.[0]?.openingReading || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      nozzles: [{ ...formData.nozzles?.[0], openingReading: parseFloat(e.target.value) }]
                    })}
                    className="w-full rounded-md border-gray-300 text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      );
    }

    return null;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pump Configuration</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure fuel types, branches, storage tanks, and pumps
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`rounded-md p-4 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedBranch('');
                }}
                className={classNames(
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                  'flex items-center gap-2 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium'
                )}
              >
                <tab.icon className="h-5 w-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {loading && !modalOpen ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'fuel-types' && renderFuelTypesTab()}
            {activeTab === 'branches' && renderBranchesTab()}
            {activeTab === 'tanks' && renderTanksTab()}
            {activeTab === 'pumps' && renderPumpsTab()}
          </>
        )}

        {/* Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={
            modalType === 'fuel-type' ? (editItem ? 'Edit Fuel Type' : 'Add Fuel Type') :
            modalType === 'branch' ? (editItem ? 'Edit Branch' : 'Add Branch') :
            modalType === 'tank' ? (editItem ? 'Edit Tank' : 'Add Tank') :
            modalType === 'pump' ? (editItem ? 'Edit Pump' : 'Add Pump') : ''
          }
        >
          {renderModalForm()}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
