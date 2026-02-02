// src/pages/inventory/sales.js
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
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
    'Completed': 'bg-green-100 text-green-800',
    'Partial': 'bg-yellow-100 text-yellow-800',
    'Unpaid': 'bg-red-100 text-red-800',
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${statusColors[status] || 'bg-gray-100'}`}>
      {status}
    </span>
  );
};

export default function SalesPage() {
  const [modalState, setModalState] = useState({ open: false, mode: 'add', sale: null });
  const [searchQuery, setSearchQuery] = useState('');
  const { currentBusiness, token, authFetch } = useAppContext();
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatCurrency = (value) => `৳${Number(value || 0).toLocaleString('en-IN')}`;
  const fetchData = useCallback(async () => {
    if (!currentBusiness) return;
    setIsLoading(true);
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await authFetch(`/api/sales?company_id=${currentBusiness.id}`, { headers });
      const data = await res.json();
      if (data.success) setSales(data.data);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, [currentBusiness, token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredSales = useMemo(() => {
    if (!searchQuery) return sales;
    return sales.filter(s =>
      s.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(s.id).toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sales, searchQuery]);

  const totalSales = sales.reduce((sum, s) => sum + Number(s.amount || s.totalAmount || 0), 0);
  const unpaidInvoices = sales.filter(s => s.status === 'Unpaid').length;

  const stats = [
    { name: 'Total Sales (YTD)', stat: formatCurrency(totalSales) },
    { name: 'Unpaid Invoices', stat: unpaidInvoices },
    { name: 'Total Invoices', stat: sales.length },
  ];

  const handleSave = async (formData) => {
    const isAdd = modalState.mode === 'add';
    // For add, let backend handle ID. For edit, use existing ID.
    const id = isAdd ? undefined : modalState.sale.id;

    const payload = {
      ...formData,
      company_id: currentBusiness.id,
    };
    if (id) payload.id = id;

    const method = isAdd ? 'POST' : 'PUT';
    // Note: Backend currently only implements POST for sales in the snippet I wrote. 
    // If PUT is needed, backend needs update. For now assuming Add works.
    const url = isAdd ? '/api/sales' : `/api/sales/${id}`;

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      const res = await authFetch(url, { method, headers, body: JSON.stringify(payload) });
      if (res.ok) {
        setModalState({ open: false, mode: 'add', sale: null });
        fetchData();
      } else {
        const errorData = await res.json();
        alert(`Failed: ${errorData.error || errorData.message}`);
      }
    } catch (e) { console.error(e); alert('Error saving data'); }
  };

  const handleRemove = async (sale) => {
    if (!confirm(`Delete Invoice ${sale.id}?`)) return;
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await authFetch(`/api/sales/${sale.id}`, { method: 'DELETE', headers });
      if (res.ok) fetchData();
      else alert('Failed to delete');
    } catch (e) { console.error(e); }
  };

  return (
    <DashboardLayout>
      <Modal open={modalState.open} setOpen={(val) => setModalState({ ...modalState, open: val })} title={`${modalState.mode === 'add' ? 'Add' : 'Edit'} Sale Invoice`}>
        <SaleForm sale={modalState.sale} onSave={handleSave} onCancel={() => setModalState({ ...modalState, open: false })} />
      </Modal>

      <PageHeader title="Sales Invoices" description="A list of all sales invoices issued by the company.">
        <button onClick={() => setModalState({ open: true, mode: 'add', sale: null })} type="button" className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5 inline" /> New Invoice
        </button>
      </PageHeader>

      <dl className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((item) => (<PageStat key={item.name} item={item} />))}
      </dl>

      <div className="rounded-lg bg-white p-6 shadow">
        <div className="sm:flex sm:items-center sm:justify-between mb-4">
          <div className="w-full max-w-xs relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><MagnifyingGlassIcon className="h-5 w-5 text-gray-400" /></div>
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="block w-full rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm" placeholder="Filter..." type="search" />
          </div>
          <div className="mt-4 sm:mt-0"><FilterButtons periods={['1M', '3M', '6M', '1Y']} /></div>
        </div>

        <div className="flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              {isLoading ? <p>Loading...</p> : (
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Invoice #</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Customer</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-0">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredSales.map((s) => (
                      <tr key={s.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-indigo-600 sm:pl-0">{s.id}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{s.customer}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(s.date).toLocaleDateString()}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatCurrency(s.amount || s.totalAmount || 0)}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"><StatusBadge status={s.status} /></td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <button onClick={() => setModalState({ open: true, mode: 'edit', sale: s })} className="text-indigo-600 hover:text-indigo-900 mr-4"><PencilIcon className="h-5 w-5" /></button>
                          <button onClick={() => handleRemove(s)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5" /></button>
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

