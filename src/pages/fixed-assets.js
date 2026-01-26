// src/pages/fixed-assets.js

import { useState, useEffect } from 'react';
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
  const formatCurrency = (value) => `৳${Number(value).toLocaleString('en-IN')}`;

  const [assets, setAssets] = useState([]);
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!selectedCompany) return;
    setIsLoading(true);
    try {
        const res = await fetch(`/api/data?type=fixed-assets&companyId=${selectedCompany.id}`);
        const data = await res.json();
        setAssets(Array.isArray(data) ? data : []);
    } catch (error) {
        console.error("Failed to fetch fixed assets:", error);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [selectedCompany]);

  const handleRemove = async (asset) => {
    if(!confirm(`Remove ${asset.name}?`)) return;
    try {
        const res = await fetch(`/api/data?type=fixed-assets&companyId=${selectedCompany.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: asset.id })
        });
        if(res.ok) fetchData();
    } catch (e) { console.error(e); }
  };

  const handleSave = async (formData) => {
    const method = modalState.mode === 'edit' ? 'PUT' : 'POST';
    try {
        const res = await fetch(`/api/data?type=fixed-assets&companyId=${selectedCompany.id}`, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if(res.ok) {
            setModalState({ ...modalState, open: false });
            fetchData();
        }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const totalCost = assets.reduce((sum, a) => sum + Number(a.cost), 0);
    const totalBookValue = assets.reduce((sum, a) => sum + Number(a.bookValue), 0);

    setStats([
        { name: 'Total Asset Cost', stat: formatCurrency(totalCost) },
        { name: 'Total Current Book Value', stat: formatCurrency(totalBookValue) },
        { name: 'Total Assets', stat: assets.length },
    ]);
  }, [assets]);

  const handleAdd = () => setModalState({ open: true, mode: 'add', asset: null });
  const handleEdit = (asset) => setModalState({ open: true, mode: 'edit', asset });
  const handleCancel = () => setModalState({ ...modalState, open: false });

  return (
    <DashboardLayout>
      <Modal open={modalState.open} setOpen={(val) => setModalState({...modalState, open: val})} title={`${modalState.mode === 'add' ? 'Add' : 'Edit'} Fixed Asset`}>
        <FixedAssetForm asset={modalState.asset} onSave={handleSave} onCancel={handleCancel} />
      </Modal>

      <PageHeader title="Fixed Assets Register" description="A list of all long-term assets owned by the company.">
        <button onClick={handleAdd} type="button" className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
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
              {isLoading ? <p className="text-center">Loading...</p> : (
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Asset Name</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Acquisition Date</th>
                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Cost</th>
                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Depreciation (Yearly)</th>
                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Current Book Value</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-0"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {assets.map((asset) => (
                    <tr key={asset.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{asset.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(asset.acquisitionDate).toLocaleDateString()}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">{formatCurrency(asset.cost)}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-red-500 text-right">({formatCurrency(asset.depreciation)})</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-gray-900 text-right">{formatCurrency(asset.bookValue)}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        <button onClick={() => handleEdit(asset)} className="text-indigo-600 hover:text-indigo-900"><PencilIcon className="h-5 w-5" /></button>
                        <button onClick={() => handleRemove(asset)} className="ml-4 text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5" /></button>
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