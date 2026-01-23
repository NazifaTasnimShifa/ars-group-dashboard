// src/pages/accounts/debtors.js

import { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { sundryDebtors } from '@/data/mockData';
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

  const formatCurrency = (value) => `৳${value.toLocaleString('en-IN')}`;

  // --- Data Preparation and Filtering ---
  const debtors = useMemo(() => {
    const companyDebtors = selectedCompany ? sundryDebtors[selectedCompany.id] : [];
    if (!searchQuery) return companyDebtors;

    return companyDebtors.filter(debtor => 
      debtor.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [selectedCompany, searchQuery]);

  const totalReceivables = debtors.reduce((sum, d) => sum + d.amount, 0);
  const overdueDebtors = debtors.filter(d => d.aging > 30).length;

  const stats = [
    { name: 'Total Outstanding', stat: formatCurrency(totalReceivables) },
    { name: 'Overdue (>30 Days)', stat: overdueDebtors },
    { name: 'Avg. Collection Period', stat: '45 Days' },
  ];

  // --- Modal Handlers ---
  const handleAdd = () => setModalState({ open: true, mode: 'add', debtor: null });
  const handleEdit = (debtor) => setModalState({ open: true, mode: 'edit', debtor });
  const handleRemove = (debtor) => alert(`This would remove ${debtor.name}.`);
  const handleSave = () => setModalState({ open: false, mode: 'add', debtor: null });
  const handleCancel = () => setModalState({ open: false, mode: 'add', debtor: null });

  return (
    <DashboardLayout>
      <Modal open={modalState.open} setOpen={(val) => setModalState({...modalState, open: val})} title={`${modalState.mode === 'add' ? 'Add' : 'Edit'} Debtor`}>
        <DebtorForm debtor={modalState.debtor} onSave={handleSave} onCancel={handleCancel} />
      </Modal>

      <PageHeader title="Sundry Debtors" description="Manage all parties who owe money to the company.">
        <button onClick={handleAdd} type="button" className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5 inline" /> Add Debtor
        </button>
      </PageHeader>

      <dl className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((item) => ( <PageStat key={item.name} item={item} /> ))}
      </dl>

      <div className="rounded-lg bg-white p-6 shadow">
        {/* --- NEW: Filter Controls --- */}
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
            <div className="mt-4 sm:mt-0">
                <FilterButtons periods={['1M', '3M', '6M', '1Y']} />
            </div>
        </div>

        {/* --- Table --- */}
        <div className="flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Name</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Due Date</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Aging</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-0"><span className="sr-only">Edit</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {debtors.map((debtor) => (
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
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}