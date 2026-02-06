// src/pages/accounts/expenses.js
// ARS Corporation - Expense Management Page

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import ExpenseForm from '@/components/forms/ExpenseForm';
import PageStat from '@/components/ui/PageStat';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon, 
  CalendarDaysIcon,
  FunnelIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  BoltIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon
} from '@heroicons/react/20/solid';

const EXPENSE_CATEGORIES = [
  { id: 'all', label: 'All Categories', icon: FunnelIcon },
  { id: 'Salaries & Wages', label: 'Salaries & Wages', icon: UserGroupIcon },
  { id: 'Utilities', label: 'Utilities', icon: BoltIcon },
  { id: 'Office Rent', label: 'Office Rent', icon: BuildingOfficeIcon },
  { id: 'Fuel & Transport', label: 'Fuel & Transport', icon: BanknotesIcon },
  { id: 'Repairs & Maintenance', label: 'Repairs', icon: WrenchScrewdriverIcon },
];

const STATUS_FILTERS = [
  { id: 'all', label: 'All Status' },
  { id: 'Paid', label: 'Paid' },
  { id: 'Accrued', label: 'Accrued' },
  { id: 'Pending', label: 'Pending' },
];

export default function ExpensesPage() {
  const [modalState, setModalState] = useState({ open: false, mode: 'add', expense: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const { currentBusiness, authFetch, formatCurrency } = useAppContext();
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!currentBusiness?.id) return;
    setIsLoading(true);
    try {
      const res = await authFetch(`/api/expenses?company_id=${currentBusiness.id}`);
      const data = await res.json();
      if (data.success) setExpenses(data.data || []);
    } catch (err) { 
      console.error('Failed to fetch expenses:', err); 
    } finally { 
      setIsLoading(false); 
    }
  }, [currentBusiness?.id, authFetch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredExpenses = useMemo(() => {
    let result = expenses;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(e => 
        e.category?.toLowerCase().includes(query) ||
        e.description?.toLowerCase().includes(query) ||
        e.payeeName?.toLowerCase().includes(query)
      );
    }
    
    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(e => e.category === categoryFilter);
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(e => e.status === statusFilter);
    }
    
    // Date range filter
    if (dateFrom) {
      result = result.filter(e => new Date(e.date) >= new Date(dateFrom));
    }
    if (dateTo) {
      result = result.filter(e => new Date(e.date) <= new Date(dateTo));
    }
    
    return result;
  }, [expenses, searchQuery, categoryFilter, statusFilter, dateFrom, dateTo]);

  // Calculate stats
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const paidExpenses = filteredExpenses.filter(e => e.status === 'Paid').reduce((sum, e) => sum + Number(e.amount), 0);
  const accruedExpenses = filteredExpenses.filter(e => e.status === 'Accrued').reduce((sum, e) => sum + Number(e.amount), 0);
  
  const stats = [
    { name: 'Total Expenses', stat: formatCurrency(totalExpenses), color: 'text-red-600' },
    { name: 'Paid', stat: formatCurrency(paidExpenses), color: 'text-green-600' },
    { name: 'Accrued (Unpaid)', stat: formatCurrency(accruedExpenses), color: 'text-yellow-600' },
    { name: 'This Month', stat: filteredExpenses.length + ' entries' },
  ];

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const breakdown = {};
    filteredExpenses.forEach(e => {
      if (!breakdown[e.category]) breakdown[e.category] = 0;
      breakdown[e.category] += Number(e.amount);
    });
    return Object.entries(breakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [filteredExpenses]);

  const handleSave = async (formData) => {
    const isAdd = modalState.mode === 'add';
    const method = isAdd ? 'POST' : 'PUT';
    const url = isAdd ? '/api/expenses' : `/api/expenses/${modalState.expense?.id}`;
    const payload = { ...formData, company_id: currentBusiness.id };

    try {
      const res = await authFetch(url, { 
        method, 
        body: JSON.stringify(payload) 
      });
      const result = await res.json();
      
      if (result.success) {
        setModalState({ open: false, mode: 'add', expense: null });
        fetchData();
      } else { 
        alert(result.message || 'Failed to save expense'); 
      }
    } catch (error) { 
      console.error(error); 
      alert('Error saving expense'); 
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      const res = await authFetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
      else alert('Failed to delete');
    } catch (error) { 
      console.error(error); 
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Accrued': return 'bg-yellow-100 text-yellow-800';
      case 'Pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    if (category?.includes('Salar') || category?.includes('Wage')) return <UserGroupIcon className="h-4 w-4" />;
    if (category?.includes('Util') || category?.includes('Electric')) return <BoltIcon className="h-4 w-4" />;
    if (category?.includes('Rent')) return <BuildingOfficeIcon className="h-4 w-4" />;
    if (category?.includes('Repair') || category?.includes('Maint')) return <WrenchScrewdriverIcon className="h-4 w-4" />;
    return <BanknotesIcon className="h-4 w-4" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Expense Management"
          subtitle="Track utility bills, wages, and operational costs"
          action={
            <button
              onClick={() => setModalState({ open: true, mode: 'add', expense: null })}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Record Expense
            </button>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
          {stats.map((item) => (
            <PageStat key={item.name} item={item} />
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {STATUS_FILTERS.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>

            {/* Date From */}
            <div className="relative">
              <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            {/* Date To */}
            <div className="relative">
              <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Expense List - 3 columns */}
          <div className="lg:col-span-3">
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm font-medium text-gray-900">
                  Expense Records ({filteredExpenses.length})
                </h3>
              </div>
              
              {isLoading ? (
                <div className="p-8 text-center text-gray-500">Loading expenses...</div>
              ) : filteredExpenses.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <BanknotesIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p>No expenses recorded yet.</p>
                  <button
                    onClick={() => setModalState({ open: true, mode: 'add', expense: null })}
                    className="mt-3 text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                  >
                    Record your first expense
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payee</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredExpenses.map((expense) => (
                        <tr key={expense.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {new Date(expense.date).toLocaleDateString('en-GB')}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">{getCategoryIcon(expense.category)}</span>
                              <span className="text-sm font-medium text-gray-900">{expense.category}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                            {expense.description || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {expense.payeeName || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-red-600 text-right">
                            {formatCurrency(expense.amount)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(expense.status)}`}>
                              {expense.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                            <button
                              onClick={() => setModalState({ open: true, mode: 'edit', expense })}
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(expense.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Category Breakdown - 1 column */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Top Categories</h3>
              {categoryBreakdown.length === 0 ? (
                <p className="text-sm text-gray-500">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {categoryBreakdown.map(([category, amount]) => (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">{getCategoryIcon(category)}</span>
                        <span className="text-sm text-gray-700 truncate max-w-[120px]">{category}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 shadow-sm rounded-lg p-4 mt-4 text-white">
              <h3 className="text-sm font-medium mb-3">Quick Add</h3>
              <div className="space-y-2">
                {['Utilities', 'Salaries & Wages', 'Office Supplies'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setModalState({ open: true, mode: 'add', expense: { category: cat } })}
                    className="w-full text-left px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-sm transition-colors"
                  >
                    + {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalState.open}
        onClose={() => setModalState({ open: false, mode: 'add', expense: null })}
        title={modalState.mode === 'add' ? 'Record New Expense' : 'Edit Expense'}
      >
        <ExpenseForm
          expense={modalState.expense}
          onSave={handleSave}
          onCancel={() => setModalState({ open: false, mode: 'add', expense: null })}
        />
      </Modal>
    </DashboardLayout>
  );
}
