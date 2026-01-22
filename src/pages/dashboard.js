// src/pages/dashboard.js

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import ProfitChart from '@/components/dashboard/ProfitChart';
import DebtorsTable from '@/components/dashboard/DebtorsTable';
import CreditorsTable from '@/components/dashboard/CreditorsTable';
import Modal from '@/components/ui/Modal';
import CashFlowSummary from '@/components/dashboard/CashFlowSummary'; // NEW
import SalesPerformance from '@/components/dashboard/SalesPerformance'; // NEW
import ExpenseBreakdown from '@/components/dashboard/ExpenseBreakdown'; // NEW
import { 
    ArrowDownIcon, 
    ArrowUpIcon, 
    BanknotesIcon,
    PlusCircleIcon,
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const [open, setOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');

  const handleOpenModal = (title) => {
    setModalTitle(title);
    setOpen(true);
  };

  const formatCurrency = (value) => `৳${value.toLocaleString('en-IN')}`;

  const stats = [
      { name: 'Opening Balance (2023)', value: formatCurrency(20701199), icon: BanknotesIcon },
      { name: 'Current Balance (2024)', value: formatCurrency(14591956), icon: BanknotesIcon },
      { name: 'Today\'s Expense', value: formatCurrency(5170), icon: ArrowDownIcon },
      { name: 'Today\'s Revenue', value: formatCurrency(13500), icon: ArrowUpIcon },
  ]

  return (
    <DashboardLayout>
      {/* Modal for adding items */}
      <Modal open={open} setOpen={setOpen} title={`Add New ${modalTitle}`}>
        <p>This is a placeholder form to add a new {modalTitle.toLowerCase()}. The real form will go here.</p>
      </Modal>

      <div className="space-y-8">
        {/* Header with Add Buttons */}
        <div className="sm:flex sm:items-center sm:justify-between">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Last 30 days</h3>
            <div className="mt-3 flex sm:ml-4 sm:mt-0">
                <button onClick={() => handleOpenModal('Product')} type="button" className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 mr-2">
                    <PlusCircleIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                    Add Product
                </button>
                <button onClick={() => handleOpenModal('Sale')} type="button" className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                    <PlusCircleIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                    Add Sale
                </button>
            </div>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <StatCard 
              key={item.name} 
              title={item.name} 
              value={item.value} 
              icon={item.icon} 
            />
          ))}
        </div>

        {/* NEW: Quick Insights Row */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <SalesPerformance />
            <ExpenseBreakdown />
        </div>

        {/* Cash Flow Summary */}
        <div>
            <CashFlowSummary />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-5">
            <RevenueChart />
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <DebtorsTable />
            <CreditorsTable />
        </div>
      </div>
    </DashboardLayout>
  );
}