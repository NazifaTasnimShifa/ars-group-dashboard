// src/pages/fixed-assets.js
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/ui/PageHeader';
import PageStat from '@/components/ui/PageStat';
import Modal from '@/components/ui/Modal';
import FixedAssetForm from '@/components/forms/FixedAssetForm';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/20/solid';

export default function FixedAssetsPage() {
  const [modalState, setModalState] = useState({ open: false, mode: 'add', asset: null });
  const { selectedCompany } = useAppContext();
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatCurrency = (value) => `৳${Number(value).toLocaleString('en-IN')}`;

  const fetchData = useCallback(async () => {
      if(!selectedCompany) return;
      setIsLoading(true);
      try {
          const res = await fetch(`/api/assets?company_id=${selectedCompany.id}`);
          const data = await res.json();
          if(data.success) setAssets(data.data);
      } catch(e) { console.error(e); }
      finally { setIsLoading(false); }
  }, [selectedCompany]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalCost = assets.reduce((sum, a) => sum + Number(a.cost), 0);
  const totalBookValue = assets.reduce((sum, a) => sum + Number(a.bookValue), 0);

  const stats = [
    { name: 'Total Asset Cost', stat: formatCurrency(totalCost) },
    { name: 'Total Current Book Value', stat: formatCurrency(totalBookValue) },
    { name: 'Total Assets', stat: assets.length },
  ];

  const handleSave = async (formData) => {
      const isAdd = modalState.mode === 'add';
      const id = isAdd ? `FA-${Date.now()}` : modalState.asset.id;
      
      const payload = { 
          ...formData, 
          company_id: selectedCompany.id,
          id: id 
      };
      
      const method = isAdd ? 'POST' : 'PUT';
      const url = isAdd ? '/api/assets' : `/api/assets/${id}`;

      try {
          const res = await fetch(url, { method, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) });
          if(res.ok) {
              setModalState({ open: false, mode: 'add', asset: null });
              fetchData();
          } else { alert('Failed to save'); }
      } catch(e) { console.error(e); alert('Error saving data'); }
  };

  const handleRemove = async (asset) => {
      if(!confirm(`Delete ${asset.name}?`)) return;
      try {
          const res = await fetch(`/api/assets/${asset.id}`, { method: 'DELETE' });
          if(res.ok) fetchData();
          else alert('Failed to delete');
      } catch(e) { console.error(e); }
  };

  return (
    <DashboardLayout>
      <Modal open={modalState.open} setOpen={(val) => setModalState({...modalState, open: val})} title={`${modalState.mode === 'add' ? 'Add' : 'Edit'} Fixed Asset`}>
        <FixedAssetForm asset={modalState.asset} onSave={handleSave} onCancel={() => setModalState({...modalState, open: false})} />
      </Modal>

      <PageHeader title="Fixed Assets Register" description="A list of all long-term assets owned by the company.">
        <button onClick={() => setModalState({ open: true, mode: 'add', asset: null })} type="button" className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5 inline" /> Add Asset
        </button>
      </PageHeader>

      <dl className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((item) => ( <PageStat key={item.name} item={item} /> ))}
      </dl>

      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="font-semibold text-gray-900 mb-4">Asset List</h3>
        <div className="flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              {isLoading ? <p>Loading...</p> : (
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Asset Name</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Acquisition Date</th>
                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Cost</th>
                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Depreciation (Yearly)</th>
                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Current Book Value</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-0">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {assets.map((asset) => (
                    <tr key={asset.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{asset.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(asset.acquisitionDate).toLocaleDateString()}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">{formatCurrency(asset.cost)}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-red-500 text-right">({formatCurrency(asset.depreciation)})</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-gray-900 text-right">{formatCurrency(asset.bookValue)}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        <button onClick={() => setModalState({ open: true, mode: 'edit', asset })} className="text-indigo-600 hover:text-indigo-900 mr-4"><PencilIcon className="h-5 w-5" /></button>
                        <button onClick={() => handleRemove(asset)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}