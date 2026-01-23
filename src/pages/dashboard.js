// src/pages/dashboard.js

import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { dashboardData } from '@/data/mockData';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import ProfitabilityRatios from '@/components/dashboard/ProfitabilityRatios';
import CurrentRatio from '@/components/dashboard/CurrentRatio';
import TopExpenses from '@/components/dashboard/TopExpenses';
import RevenueSources from '@/components/dashboard/RevenueSources';
import RevenueChart from '@/components/dashboard/RevenueChart';
import DebtorsTable from '@/components/dashboard/DebtorsTable';
import CreditorsTable from '@/components/dashboard/CreditorsTable';
import Modal from '@/components/ui/Modal'; // THIS IS THE MISSING LINE
import { 
    BanknotesIcon, 
    ArrowUpIcon, 
    ArrowDownIcon, 
    PlusCircleIcon 
} from '@heroicons/react/24/outline';

// Map icon names from data to actual icon components
const iconMap = {
    BanknotesIcon,
    ArrowUpIcon,
    ArrowDownIcon,
};

export default function DashboardPage() {
  const [open, setOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const { selectedCompany } = useAppContext();

  const handleOpenModal = (title) => {
    setModalTitle(title);
    setOpen(true);
  };

  const formatCurrency = (value) => `৳${value.toLocaleString('en-IN')}`;

  const data = selectedCompany ? dashboardData[selectedCompany.id] : null;

  if (!data) {
    // This shows while the selectedCompany is being set
    return <DashboardLayout><div>Loading company data...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <Modal open={open} setOpen={setOpen} title={`Add New ${modalTitle}`}>
        <p>This is a placeholder form to add a new {modalTitle.toLowerCase()}. The real form will go here.</p>
      </Modal>

      <div className="space-y-8">
        <div className="sm:flex sm:items-center sm:justify-between">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Dashboard Overview</h3>
            <div className="mt-3 flex sm:ml-4 sm:mt-0">
                <button onClick={() => handleOpenModal('Product')} type="button" className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 mr-2">
                    <PlusCircleIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                    Add Product
                </button>
                <button onClick={() => handleOpenModal('Sale')} type="button" className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                    <PlusCircleIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                    Add Sale
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {data.stats.map((item) => ( 
            <StatCard 
              key={item.name} 
              title={item.name}
              value={formatCurrency(item.value)}
              icon={iconMap[item.icon]} 
            /> 
          ))}
        </div>

        <div>
          <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">Financial Health Overview</h3>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2"><ProfitabilityRatios data={data.profitability} /></div>
              <CurrentRatio data={data.currentRatio} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          <div className="lg:col-span-3"><TopExpenses data={data.topExpenses} /></div>
          <div className="lg:col-span-2"><RevenueSources data={data.revenueSources} /></div>
        </div>

        <div className="grid grid-cols-1 gap-5">
            <RevenueChart />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <DebtorsTable />
            <CreditorsTable />
        </div>
      </div>
    </DashboardLayout>
  );
}