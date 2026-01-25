// src/pages/accounts/debtors.js

import { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
// We NO LONGER import sundryDebtors from mockData.js
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import DebtorForm from '@/components/forms/DebtorForm';
import PageStat from '@/components/ui/PageStat';
import FilterButtons from '@/components/ui/FilterButtons';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';

// IMPORTANT: Set this to the URL of your PHP API
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DebtorsPage() {
  const [modalState, setModalState] = useState({ open: false, mode: 'add', debtor: null });
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedCompany } = useAppContext();

  // --- NEW: State for live data ---
  const [debtors, setDebtors] = useState([]);
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatCurrency = (value) => `৳${Number(value).toLocaleString('en-IN')}`;

  // --- NEW: useEffect to fetch data from the API ---
  useEffect(() => {
    if (selectedCompany) {
      setIsLoading(true);

      fetch(`${API_URL}/get_debtors.php?company_id=${selectedCompany.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setDebtors(data.debtors);
          }
          setIsLoading(false);
        })
        .catch(error => {
          console.error("Failed to fetch debtors:", error);
          setIsLoading(false);
        });
    }
  }, [selectedCompany]); // This runs every time the company changes

  // --- Data Preparation and Filtering (now memoized) ---
  const filteredDebtors = useMemo(() => {
    if (!searchQuery) return debtors;
    return debtors.filter(debtor => 
      debtor.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [debtors, searchQuery]);

  // --- NEW: useEffect to update stats when data changes ---
  useEffect(() => {
    const totalReceivables = debtors.reduce((sum, d) => sum + Number(d.amount), 0);
    const overdueDebtors = debtors.filter(d => d.aging > 30).length;

    setStats([
      { name: 'Total Outstanding', stat: formatCurrency(totalReceivables) },
      { name: 'Overdue (>30 Days)', stat: overdueDebtors },
      { name: 'Avg. Collection Period', stat: '45 Days' }, // Mock stat
    ]);
  }, [debtors]);

  // --- Modal Handlers (no changes) ---
  const handleAdd = () => setModalState({ open: true, mode: 'add', debtor: null });
  const handleEdit = (debtor) => setModalState({ open: true, mode: 'edit', debtor });
  const handleRemove = (debtor) => alert(`This would remove ${debtor.name}.`);
  const handleSave = () => setModalState({ open: false, mode: 'add', debtor: null });
  const handleCancel = () => setModalState({ open: false, mode: 'add', debtor: null });

  return (
    <DashboardLayout>
      {/* --- Modal (no changes) --- */}
      <Modal open={modalState.open} setOpen={(val) => setModalState({...modalState, open: val})} title={`${modalState.mode === 'add' ? 'Add' : 'Edit'} Debtor`}>
        <DebtorForm debtor={modalState.debtor} onSave={handleSave} onCancel={handleCancel} />
      </Modal>

      <PageHeader title="Sundry Debtors" description="Manage all parties who owe money to the company.">
        {/* ... (Add Debtor button is the same) ... */}
      </PageHeader>

      <dl className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((item) => ( <PageStat key={item.name} item={item} /> ))}
      </dl>

      <div className="rounded-lg bg-white p-6 shadow">
        {/* --- Filter Controls (no changes) --- */}

        {/* --- Table (now uses filteredDebtors) --- */}
        <div className="flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              {isLoading ? (
                <p>Loading data...</p>
              ) : (
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    {/* ... (table headers are the same) ... */}
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredDebtors.map((debtor) => (
                      <tr key={debtor.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{debtor.name}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatCurrency(debtor.amount)}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{debtor.due}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{debtor.aging} days</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <button onClick={() => handleEdit(debtor)} className="text-indigo-600 hover:text-indigo-900"><PencilIcon className="h-5 w-5" /></button>
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