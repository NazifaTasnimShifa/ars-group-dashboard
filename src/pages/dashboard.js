// src/pages/dashboard.js

import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { dashboardData } from '@/data/mockData'; // NEW
import DashboardLayout from '@/components/layout/DashboardLayout';
// ... other component imports
import StatCard from '@/components/dashboard/StatCard';
import ProfitabilityRatios from '@/components/dashboard/ProfitabilityRatios';
import CurrentRatio from '@/components/dashboard/CurrentRatio';
import TopExpenses from '@/components/dashboard/TopExpenses';
import RevenueSources from '@/components/dashboard/RevenueSources';
import { BanknotesIcon, ArrowUpIcon, ArrowDownIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

// Map icon names from data to actual components
const iconMap = {
    BanknotesIcon,
    ArrowUpIcon,
    ArrowDownIcon,
};

export default function DashboardPage() {
  const [open, setOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const { selectedCompany } = useAppContext(); // Get the selected company

  const handleOpenModal = (title) => {
    setModalTitle(title);
    setOpen(true);
  };

  const formatCurrency = (value) => `৳${value.toLocaleString('en-IN')}`;

  // NEW: Dynamically get data based on selected company
  const data = selectedCompany ? dashboardData[selectedCompany.id] : null;

  if (!data) {
    return <DashboardLayout><div>Loading data...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      {/* ... Modal and Header ... */}
      <Modal open={open} setOpen={setOpen} title={`Add New ${modalTitle}`}>
        <p>This is a placeholder form to add a new {modalTitle.toLowerCase()}. The real form will go here.</p>
      </Modal>

      <div className="space-y-8">
        <div className="sm:flex sm:items-center sm:justify-between">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Dashboard Overview</h3>
            <div className="mt-3 flex sm:ml-4 sm:mt-0">
                <button onClick={() => handleOpenModal('Product')} type="button" className="... button styles ...">
                    <PlusCircleIcon className="..." /> Add Product
                </button>
                <button onClick={() => handleOpenModal('Sale')} type="button" className="... button styles ...">
                    <PlusCircleIcon className="..." /> Add Sale
                </button>
            </div>
        </div>

        {/* KPI Cards Row - Now uses dynamic data */}
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

        {/* Financial Health Row - Pass dynamic data */}
        <div>
          <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">Financial Health Overview</h3>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2"><ProfitabilityRatios data={data.profitability} /></div>
              <CurrentRatio data={data.currentRatio} />
          </div>
        </div>

        {/* Insights Row - Pass dynamic data */}
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