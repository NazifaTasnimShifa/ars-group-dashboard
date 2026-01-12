// src/pages/inventory/sales.js

import { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { salesData } from '@/data/mockData';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import SaleForm from '@/components/forms/SaleForm';
import PageStat from '@/components/ui/PageStat';
import FilterButtons from '@/components/ui/FilterButtons';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';

const StatusBadge = ({ status }) => {
    const statusColors = {
        'Paid': 'bg-green-100 text-green-800',
        'Partial': 'bg-yellow-100 text-yellow-800',
        'Unpaid': 'bg-red-100 text-red-800',
    };
    return (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${statusColors[status]}`}>
            {status}
        </span>
    );
};

export default function SalesPage() {
  const [modalState, setModalState] = useState({ open: false, mode: 'add', sale: null });
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedCompany } = useAppContext();
  const formatCurrency = (value) => `৳${value.toLocaleString('en-IN')}`;

  const sales = useMemo(() => {
    const companySales = selectedCompany ? salesData[selectedCompany.id] : [];
    if (!searchQuery) return companySales;
    return companySales.filter(s => 
      s.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [selectedCompany, searchQuery]);

  const totalSales = sales.reduce((sum, s) => sum + s.amount, 0);
  const unpaidInvoices = sales.filter(s => s.status === 'Unpaid').length;

  const stats = [
    { name: 'Total Sales (YTD)', stat: formatCurrency(totalSales) },
    { name: 'Unpaid Invoices', stat: unpaidInvoices },
    { name: 'Total Invoices', stat: sales.length },
  ];

  const handleAdd = () => setModalState({ open: true, mode: 'add', sale: null });
  const handleEdit = (sale) => setModalState({ open: true, mode: 'edit', sale });
  const handleRemove = (sale) => alert(`This would remove Invoice ${sale.id}.`);
  const handleSave = () => setModalState({ open: false, mode: 'add', sale: null });
  const handleCancel = () => setModalState({ open: false, mode: 'add', sale: null });

  return (
    <DashboardLayout>
      <Modal open={modalState.open} setOpen={(val) => setModalState({...modalState, open: val})} title={`${modalState.mode === 'add' ? 'Add' : 'Edit'} Sale Invoice`}>
        <SaleForm sale={modalState.sale} onSave={handleSave} onCancel={handleCancel} />
      </Modal>

      <PageHeader title="Sales Invoices" description="A list of all sales invoices issued by the company.">
        <button onClick={handleAdd} type="button" className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5 inline" /> New Invoice
        </button>
      </PageHeader>

      <dl className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((item) => ( <PageStat key={item.name} item={item} /> ))}
      </dl>

      <div className="rounded-lg bg-white p-6 shadow">
        <div className="sm:flex sm:items-center sm:justify-between mb-4">
            <div className="w-full max-w-xs">
              <label htmlFor="search" className="sr-only">Search</label>
              <input id="search" name="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="block w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" placeholder="Filter by Invoice# or Customer..." type="search" />
            </div>
            <div className="mt-4 sm:mt-0">
                <FilterButtons periods={['1M', '3M', '6M', '1Y']} />
            </div>
        </div>

        <div className="flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Invoice #</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Customer</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-0"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {sales.map((s) => (
                    <tr key={s.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-indigo-600 sm:pl-0 hover:underline cursor-pointer">{s.id}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{s.customer}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{s.date}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatCurrency(s.amount)}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"><StatusBadge status={s.status} /></td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        <button onClick={() => handleEdit(s)} className="text-indigo-600 hover:text-indigo-900"><PencilIcon className="h-5 w-5" /></button>
                        <button onClick={() => handleRemove(s)} className="ml-4 text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5" /></button>
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