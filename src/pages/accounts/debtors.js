// src/pages/accounts/debtors.js
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import DebtorForm from '@/components/forms/DebtorForm';
import PageStat from '@/components/ui/PageStat';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';

export default function DebtorsPage() {
  const [modalState, setModalState] = useState({ open: false, mode: 'add', debtor: null });
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedCompany, token } = useAppContext();
  const [debtors, setDebtors] = useState([]);
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatCurrency = (value) => `৳${Number(value).toLocaleString('en-IN')}`;

  const fetchData = useCallback(async () => {
    if (!selectedCompany) return;
    setIsLoading(true);
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(`/api/debtors?company_id=${selectedCompany.id}`, { headers });
      const data = await res.json();
      if (data.success) setDebtors(data.data);
    } catch (error) { console.error(error); }
    finally { setIsLoading(false); }
  }, [selectedCompany, token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const totalReceivables = debtors.reduce((sum, d) => sum + Number(d.amount), 0);
    const overdueDebtors = debtors.filter(d => d.aging > 30).length;
    setStats([
      { name: 'Total Outstanding', stat: formatCurrency(totalReceivables) },
      { name: 'Overdue (>30 Days)', stat: overdueDebtors },
      { name: 'Avg. Collection Period', stat: '45 Days' },
    ]);
  }, [debtors]);

  const filteredDebtors = useMemo(() => {
    if (!searchQuery) return debtors;
    return debtors.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [debtors, searchQuery]);

  const handleSave = async (formData) => {
    const isAdd = modalState.mode === 'add';
    const method = isAdd ? 'POST' : 'PUT';

    // For numeric ID, do NOT send ID in Create URL or Body. For Edit, append ID to URL.
    const url = isAdd ? '/api/debtors' : `/api/debtors/${modalState.debtor.id}`;

    // Ensure company_id is present
    const payload = { ...formData, company_id: selectedCompany.id };

    // Remove ID from payload for update (handled in URL)
    if (!isAdd) delete payload.id;

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
      if (res.ok) {
        setModalState({ open: false, mode: 'add', debtor: null });
        fetchData();
      } else { alert('Failed to save'); }
    } catch (error) { console.error(error); alert('Error saving data'); }
  };

  const handleRemove = async (debtor) => {
    if (!confirm(`Delete ${debtor.name}?`)) return;
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(`/api/debtors/${debtor.id}`, { method: 'DELETE', headers });
      if (res.ok) fetchData();
    } catch (error) { console.error(error); }
  };

  return (
    <DashboardLayout>
      <Modal open={modalState.open} setOpen={(val) => setModalState({ ...modalState, open: val })} title={`${modalState.mode === 'add' ? 'Add' : 'Edit'} Debtor`}>
        <DebtorForm debtor={modalState.debtor} onSave={handleSave} onCancel={() => setModalState({ ...modalState, open: false })} />
      </Modal>

      <PageHeader title="Sundry Debtors" description="Manage receivables.">
        <button onClick={() => setModalState({ open: true, mode: 'add', debtor: null })} type="button" className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5 inline" /> Add Debtor
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
                    {filteredDebtors.map((d) => (
                      <tr key={d.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{d.name}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatCurrency(d.amount)}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(d.due).toLocaleDateString()}</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <button onClick={() => setModalState({ open: true, mode: 'edit', debtor: d })} className="text-indigo-600 hover:text-indigo-900 mr-4"><PencilIcon className="h-5 w-5" /></button>
                          <button onClick={() => handleRemove(d)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5" /></button>
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