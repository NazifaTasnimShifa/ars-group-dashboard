// src/pages/accounts/debtors.js
import { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import DebtorForm from '@/components/forms/DebtorForm';
import PageStat from '@/components/ui/PageStat';
import FilterButtons from '@/components/ui/FilterButtons';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';

export default function DebtorsPage() {
  const [modalState, setModalState] = useState({ open: false, mode: 'add', debtor: null });
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedCompany } = useAppContext();

  const [debtors, setDebtors] = useState([]);
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatCurrency = (value) => `৳${Number(value).toLocaleString('en-IN')}`;

  // Fetch Data
  const fetchData = async () => {
    if (!selectedCompany) return;
    setIsLoading(true);
    try {
        const res = await fetch(`/api/debtors?company_id=${selectedCompany.id}`);
        const data = await res.json();
        if (data.success) {
            setDebtors(data.data);
        }
    } catch (error) {
        console.error("Failed to fetch debtors:", error);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCompany]);

  // Stats Logic
  useEffect(() => {
    const totalReceivables = debtors.reduce((sum, d) => sum + Number(d.amount), 0);
    const overdueDebtors = debtors.filter(d => d.aging > 30).length;
    setStats([
      { name: 'Total Outstanding', stat: formatCurrency(totalReceivables) },
      { name: 'Overdue (>30 Days)', stat: overdueDebtors },
      { name: 'Avg. Collection Period', stat: '45 Days' },
    ]);
  }, [debtors]);

  // Filter
  const filteredDebtors = useMemo(() => {
    if (!searchQuery) return debtors;
    return debtors.filter(debtor => 
      debtor.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [debtors, searchQuery]);

  // CRUD Handlers
  const handleSave = async (formData) => {
    const method = modalState.mode === 'add' ? 'POST' : 'PUT';
    const url = modalState.mode === 'add' ? '/api/debtors' : `/api/debtors/${modalState.debtor.id}`;
    
    // Add company_id to payload for new records
    const payload = { ...formData, company_id: selectedCompany.id };

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            setModalState({ open: false, mode: 'add', debtor: null });
            fetchData(); // Refresh data
        } else {
            alert('Failed to save');
        }
    } catch (error) {
        console.error(error);
        alert('Error saving data');
    }
  };

  const handleRemove = async (debtor) => {
      if (!confirm(`Are you sure you want to delete ${debtor.name}?`)) return;
      
      try {
          const res = await fetch(`/api/debtors/${debtor.id}`, { method: 'DELETE' });
          if (res.ok) fetchData();
      } catch(error) {
          console.error(error);
          alert('Failed to delete');
      }
  };

  return (
    <DashboardLayout>
      <Modal open={modalState.open} setOpen={(val) => setModalState({...modalState, open: val})} title={`${modalState.mode === 'add' ? 'Add' : 'Edit'} Debtor`}>
        <DebtorForm 
            debtor={modalState.debtor} 
            onSave={handleSave} // Pass the handler that takes data
            onCancel={() => setModalState({...modalState, open: false})} 
        />
      </Modal>

      <PageHeader title="Sundry Debtors" description="Manage all parties who owe money to the company.">
         <button onClick={() => setModalState({ open: true, mode: 'add', debtor: null })} type="button" className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5 inline" /> Add Debtor
        </button>
      </PageHeader>

      <dl className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((item) => ( <PageStat key={item.name} item={item} /> ))}
      </dl>

      <div className="rounded-lg bg-white p-6 shadow">
         <div className="mb-4 xl:flex xl:items-center xl:justify-between">
            <div className="w-full max-w-xs">
              <label htmlFor="search" className="sr-only">Search</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input id="search" name="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="block w-full rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" placeholder="Filter by name..." type="search" />
              </div>
            </div>
        </div>

        <div className="flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
               {isLoading ? <p className="p-4 text-center text-gray-500">Loading...</p> : (
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Name</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Due Date</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Aging</th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-0"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredDebtors.map((debtor) => (
                      <tr key={debtor.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{debtor.name}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatCurrency(debtor.amount)}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(debtor.due).toLocaleDateString()}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{debtor.aging} days</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <button onClick={() => setModalState({ open: true, mode: 'edit', debtor })} className="text-indigo-600 hover:text-indigo-900"><PencilIcon className="h-5 w-5" /></button>
                          <button onClick={() => handleRemove(debtor)} className="ml-4 text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5" /></button>
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