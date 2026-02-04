import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import PurchaseOrderForm from '@/components/forms/PurchaseOrderForm';
import PageStat from '@/components/ui/PageStat';
import DateRangeFilter from '@/components/ui/DateRangeFilter';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';

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
  const { currentBusiness, token, authFetch } = useAppContext();
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  const formatCurrency = (value) => `৳${Number(value || 0).toLocaleString('en-IN')}`;

  const fetchData = useCallback(async (range) => {
    if (!currentBusiness) return;

    // key fix: use provided range or fallback to state
    const start = range?.startDate || dateRange.startDate;
    const end = range?.endDate || dateRange.endDate;

    if (!start || !end) return;

    setIsLoading(true);
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await authFetch(`/api/purchases?company_id=${currentBusiness.id}&startDate=${start}&endDate=${end}`, { headers });
      const data = await res.json();
      if (data.success) setPurchases(data.data);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, [currentBusiness, token, dateRange]);

  // Initial fetch handled by Filter
  // useEffect(() => { fetchData(); }, [fetchData]);

  const handleFilterChange = (range) => {
    setDateRange(range);
    fetchData(range);
  };

  const handleRemove = async (purchase) => {
    if (!confirm(`Remove purchase ${purchase.id}?`)) return;
    try {
      const res = await authFetch(`/api/purchases/${purchase.id}`, { method: 'DELETE' });
      if (res.ok) fetchData(dateRange);
    } catch (e) { console.error(e); }
  };

  const filteredPurchases = useMemo(() => {
    if (!searchQuery) return purchases;
    return purchases.filter(p =>
      (p.id && p.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.supplier && p.supplier.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [purchases, searchQuery]);


  return (
    <DashboardLayout>
      {/* ... */}

      {/* ... */}

      <div className="rounded-lg bg-white p-6 shadow">
        <div className="sm:flex sm:items-center sm:justify-between mb-4">
          <div className="w-full max-w-xs relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><MagnifyingGlassIcon className="h-5 w-5 text-gray-400" /></div>
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="block w-full rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm" placeholder="Filter by PO# or Supplier..." type="search" />
          </div>
          <div className="mt-4 sm:mt-0">
            <DateRangeFilter onFilterChange={handleFilterChange} />
          </div>
        </div>

        <div className="flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              {isLoading ? <p>Loading...</p> : (
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">PO Number</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Supplier</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-0">Actions</th>
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
                          <button onClick={() => setModalState({ open: true, mode: 'edit', purchase: p })} className="text-indigo-600 hover:text-indigo-900 mr-4"><PencilIcon className="h-5 w-5" /></button>
                          <button onClick={() => handleRemove(p)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5" /></button>
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

