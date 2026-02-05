// src/pages/accounts/debtors.js
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import DebtorForm from '@/components/forms/DebtorForm';
import PageStat from '@/components/ui/PageStat';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, CalendarDaysIcon, FunnelIcon } from '@heroicons/react/20/solid';

const AGING_FILTERS = [
  { id: 'all', label: 'All' },
  { id: '0-30', label: '0-30 Days' },
  { id: '31-60', label: '31-60 Days' },
  { id: '61-90', label: '61-90 Days' },
  { id: '90+', label: '90+ Days' },
];

export default function DebtorsPage() {
  const [modalState, setModalState] = useState({ open: false, mode: 'add', debtor: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [agingFilter, setAgingFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const { currentBusiness, token, authFetch } = useAppContext();
  const [debtors, setDebtors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatCurrency = (value) => `৳${Number(value || 0).toLocaleString('en-IN')}`;
  
  // Calculate aging in days
  const calculateAging = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Get aging badge color
  const getAgingBadge = (days) => {
    if (days <= 30) return { color: 'bg-green-100 text-green-800', label: `${days}d` };
    if (days <= 60) return { color: 'bg-yellow-100 text-yellow-800', label: `${days}d` };
    if (days <= 90) return { color: 'bg-orange-100 text-orange-800', label: `${days}d` };
    return { color: 'bg-red-100 text-red-800', label: `${days}d` };
  };

  const fetchData = useCallback(async () => {
    if (!currentBusiness) return;
    setIsLoading(true);
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await authFetch(`/api/debtors?company_id=${currentBusiness.id}`, { headers });
      const data = await res.json();
      if (data.success) setDebtors(data.data);
    } catch (error) { console.error(error); }
    finally { setIsLoading(false); }
  }, [currentBusiness, token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredDebtors = useMemo(() => {
    let result = debtors;
    
    // Search filter
    if (searchQuery) {
      result = result.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    // Date range filter
    if (dateFrom) {
      result = result.filter(d => new Date(d.due) >= new Date(dateFrom));
    }
    if (dateTo) {
      result = result.filter(d => new Date(d.due) <= new Date(dateTo));
    }
    
    // Aging filter
    if (agingFilter !== 'all') {
      result = result.filter(d => {
        const aging = calculateAging(d.due);
        if (agingFilter === '0-30') return aging <= 30;
        if (agingFilter === '31-60') return aging > 30 && aging <= 60;
        if (agingFilter === '61-90') return aging > 60 && aging <= 90;
        if (agingFilter === '90+') return aging > 90;
        return true;
      });
    }
    
    return result;
  }, [debtors, searchQuery, agingFilter, dateFrom, dateTo]);

  const totalReceivables = filteredDebtors.reduce((sum, d) => sum + Number(d.amount), 0);
  const overdueCount = filteredDebtors.filter(d => calculateAging(d.due) > 30).length;
  const stats = [
    { name: 'Total Outstanding', stat: formatCurrency(totalReceivables) },
    { name: 'Overdue (>30 Days)', stat: overdueCount },
    { name: 'Total Debtors', stat: filteredDebtors.length },
  ];

  const handleSave = async (formData) => {
    const isAdd = modalState.mode === 'add';
    const method = isAdd ? 'POST' : 'PUT';
    const url = isAdd ? '/api/debtors' : `/api/debtors/${modalState.debtor.id}`;
    const payload = { ...formData, company_id: currentBusiness.id };
    if (!isAdd) delete payload.id;

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      const res = await authFetch(url, { method, headers, body: JSON.stringify(payload) });
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
      const res = await authFetch(`/api/debtors/${debtor.id}`, { method: 'DELETE', headers });
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
        {/* Filters Row */}
        <div className="mb-4 flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="w-full max-w-xs relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><MagnifyingGlassIcon className="h-5 w-5 text-gray-400" /></div>
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="block w-full rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm" placeholder="Search..." type="search" />
          </div>
          
          {/* Aging Filter */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select value={agingFilter} onChange={(e) => setAgingFilter(e.target.value)} className="rounded-md border-gray-300 text-sm">
              {AGING_FILTERS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
            </select>
          </div>
          
          {/* Date Range */}
          <div className="flex items-center gap-2">
            <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-md border-gray-300 text-sm" placeholder="From" />
            <span className="text-gray-400">-</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-md border-gray-300 text-sm" placeholder="To" />
          </div>
          
          {/* Clear Filters */}
          {(agingFilter !== 'all' || dateFrom || dateTo) && (
            <button onClick={() => { setAgingFilter('all'); setDateFrom(''); setDateTo(''); }} className="text-sm text-indigo-600 hover:text-indigo-800">
              Clear Filters
            </button>
          )}
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
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Due Date</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Aging</th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-0">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredDebtors.map((d) => {
                      const aging = calculateAging(d.due);
                      const badge = getAgingBadge(aging);
                      return (
                        <tr key={d.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{d.name}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatCurrency(d.amount)}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(d.due).toLocaleDateString()}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${badge.color}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                            <button onClick={() => setModalState({ open: true, mode: 'edit', debtor: d })} className="text-indigo-600 hover:text-indigo-900 mr-4"><PencilIcon className="h-5 w-5" /></button>
                            <button onClick={() => handleRemove(d)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5" /></button>
                          </td>
                        </tr>
                      );
                    })}
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
