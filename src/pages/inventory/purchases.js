// src/pages/inventory/purchases.js

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import PurchaseOrderForm from '@/components/forms/PurchaseOrderForm';
import PageStat from '@/components/ui/PageStat';
import FilterButtons from '@/components/ui/FilterButtons';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/20/solid';

const StatusBadge = ({ status }) => {
    const statusColors = {
        'Paid': 'bg-green-100 text-green-800',
        'Partial': 'bg-yellow-100 text-yellow-800',
        'Unpaid': 'bg-red-100 text-red-800',
    };
    return (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${statusColors[status] || 'bg-gray-100'}`}>
            {status}
        </span>
    );
};

export default function PurchasesPage() {
  const [modalState, setModalState] = useState({ open: false, mode: 'add', purchase: null });
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedCompany } = useAppContext();
  const formatCurrency = (value) => `৳${Number(value).toLocaleString('en-IN')}`;

  const [purchases, setPurchases] = useState([]);
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!selectedCompany) return;
    setIsLoading(true);
    try {
        const res = await fetch(`/api/data?type=purchases&companyId=${selectedCompany.id}`);
        const data = await res.json();
        setPurchases(Array.isArray(data) ? data : []);
    } catch (error) {
        console.error("Failed to fetch purchases:", error);
    } finally {
        setIsLoading(false);
    }
  }, [selectedCompany]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRemove = async (purchase) => {
    if(!confirm(`Remove ${purchase.id}?`)) return;
    try {
        const res = await fetch(`/api/data?type=purchases&companyId=${selectedCompany.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: purchase.id })
        });
        if(res.ok) fetchData();
    } catch (e) { console.error(e); }
  };

  const handleSave = async (formData) => {
    const method = modalState.mode === 'edit' ? 'PUT' : 'POST';
    try {
        const res = await fetch(`/api/data?type=purchases&companyId=${selectedCompany.id}`, {
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

  const filteredPurchases = useMemo(() => {
    if (!searchQuery) return purchases;
    return purchases.filter(p => 
      p.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [purchases, searchQuery]);

  useEffect(() => {
    const totalPurchases = purchases.reduce((sum, p) => sum + Number(p.amount), 0);
    const unpaidOrders = purchases.filter(p => p.status === 'Unpaid' || p.status === 'Partial').length;
    const uniqueSuppliers = new Set(purchases.map(p => p.supplier)).size;

    setStats([
        { name: 'Total Purchases (YTD)', stat: formatCurrency(totalPurchases) },
        { name: 'Unpaid/Partial Orders', stat: unpaidOrders },
        { name: 'Total Suppliers', stat: uniqueSuppliers },
    ]);
  }, [purchases]);

  const handleAdd = () => setModalState({ open: true, mode: 'add', purchase: null });
  const handleEdit = (purchase) => setModalState({ open: true, mode: 'edit', purchase });
  const handleCancel = () => setModalState({ ...modalState, open: false });

  return (
    <DashboardLayout>
      <Modal 
        open={modalState.open} 
        setOpen={(val) => setModalState({...modalState, open: val})} 
        title={`${modalState.mode === 'add' ? 'Add' : 'Edit'} Purchase Order`}
      >
        <PurchaseOrderForm purchase={modalState.purchase} onSave={handleSave} onCancel={handleCancel} />
      </Modal>

      <PageHeader title="Purchase Orders" description="A list of all purchases made by the company.">
        <button onClick={handleAdd} type="button" className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5 inline" /> New Purchase Order
        </button>
      </PageHeader>

      <dl className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((item) => ( <PageStat key={item.name} item={item} /> ))}
      </dl>

      <div className="rounded-lg bg-white p-6 shadow">
        <div className="sm:flex sm:items-center sm:justify-between mb-4">
            <div className="w-full max-w-xs">
              <label htmlFor="search" className="sr-only">Search</label>
              <input id="search" name="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="block w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" placeholder="Filter by PO# or Supplier..." type="search" />
            </div>
            <div className="mt-4 sm:mt-0">
                <FilterButtons periods={['1M', '3M', '6M', '1Y']} />
            </div>
        </div>

        <div className="flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              {isLoading ? <p className="text-center py-4 text-gray-500">Loading...</p> : (
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">PO Number</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Supplier</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-0"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredPurchases.map((p) => (
                    <tr key={p.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-indigo-600 sm:pl-0 hover:underline cursor-pointer">{p.id}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{p.supplier}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(p.date).toLocaleDateString()}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatCurrency(p.amount)}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"><StatusBadge status={p.status} /></td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        <button onClick={() => handleEdit(p)} className="text-indigo-600 hover:text-indigo-900"><PencilIcon className="h-5 w-5" /></button>
                        <button onClick={() => handleRemove(p)} className="ml-4 text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5" /></button>
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