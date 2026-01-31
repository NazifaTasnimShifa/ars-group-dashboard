// src/pages/accounts/creditors.js
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import CreditorForm from '@/components/forms/CreditorForm';
import PageStat from '@/components/ui/PageStat';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';

export default function CreditorsPage() {
  const [modalState, setModalState] = useState({ open: false, mode: 'add', creditor: null });
  const [searchQuery, setSearchQuery] = useState('');
  const { currentBusiness, token } = useAppContext();
  const [creditors, setCreditors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatCurrency = (value) => `৳${Number(value).toLocaleString('en-IN')}`;

  const fetchData = useCallback(async () => {
    if (!currentBusiness) return;
    setIsLoading(true);
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(`/api/creditors?company_id=${currentBusiness.id}`, { headers });
      const data = await res.json();
      if (data.success) setCreditors(data.data);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  }, [currentBusiness, token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredCreditors = useMemo(() => {
    if (!searchQuery) return creditors;
    return creditors.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [creditors, searchQuery]);

  const totalPayables = creditors.reduce((sum, c) => sum + Number(c.amount), 0);
  const stats = [{ name: 'Total Payables', stat: formatCurrency(totalPayables) }];

  const handleSave = async (formData) => {
    const isAdd = modalState.mode === 'add';
    const method = isAdd ? 'POST' : 'PUT';

    // Numeric ID handling: Create URL does not need ID, Update URL needs appended ID
    const url = isAdd ? '/api/creditors' : `/api/creditors/${modalState.creditor.id}`;

    const payload = { ...formData, company_id: currentBusiness.id };
    if (isAdd) delete payload.id; // Ensure ID is not sent for creation

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setModalState({ open: false, mode: 'add', creditor: null });
        fetchData();
      } else { alert('Failed to save'); }
    } catch (error) { console.error(error); alert('Error saving data'); }
  };

  const handleRemove = async (creditor) => {
    if (!confirm(`Delete ${creditor.name}?`)) return;
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(`/api/creditors/${creditor.id}`, { method: 'DELETE', headers });
      if (res.ok) fetchData();
      else alert('Failed to delete');
    } catch (err) { console.error(err); }
  };

  return (
    <DashboardLayout>
      <Modal open={modalState.open} setOpen={(val) => setModalState({ ...modalState, open: val })} title={`${modalState.mode === 'add' ? 'Add' : 'Edit'} Creditor`}>
        <CreditorForm creditor={modalState.creditor} onSave={handleSave} onCancel={() => setModalState({ ...modalState, open: false })} />
      </Modal>

      <PageHeader title="Sundry Creditors" description="Manage payables.">
        <button onClick={() => setModalState({ open: true, mode: 'add', creditor: null })} type="button" className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5 inline" /> Add Creditor
        </button>
      </PageHeader>

      <dl className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((item) => (<PageStat key={item.name} item={item} />))}
      </dl>

      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 w-full max-w-xs relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><MagnifyingGlassIcon className="h-5 w-5 text-gray-400" /></div>
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="block w-full rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm" placeholder="Search..." type="search" />
        </div>

        <div className="flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              {isLoading ? <p>Loading...</p> : (
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Name</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Due</th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-0">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredCreditors.map((c) => (
                      <tr key={c.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{c.name}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatCurrency(c.amount)}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(c.due).toLocaleDateString()}</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <button onClick={() => setModalState({ open: true, mode: 'edit', creditor: c })} className="text-indigo-600 hover:text-indigo-900 mr-4"><PencilIcon className="h-5 w-5" /></button>
                          <button onClick={() => handleRemove(c)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5" /></button>
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
