// src/pages/dashboard.js

import { useState, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
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
import Modal from '@/components/ui/Modal';

import DebtorForm from '@/components/forms/DebtorForm';
import CreditorForm from '@/components/forms/CreditorForm';
import InventoryItemForm from '@/components/forms/InventoryItemForm';
import SaleForm from '@/components/forms/SaleForm';
import FixedAssetForm from '@/components/forms/FixedAssetForm';

import {
  BanknotesIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronDownIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';

const iconMap = {
  BanknotesIcon,
  ArrowUpIcon,
  ArrowDownIcon,
};

export default function DashboardPage() {
  const [modalState, setModalState] = useState({ open: false, title: '', content: null });
  const { selectedCompany } = useAppContext();

  const formatCurrency = (value) => `৳${(value ?? 0).toLocaleString('en-IN')}`;

  // Safe access to data
  const data = selectedCompany ? dashboardData[selectedCompany.id] : null;

  const handleOpenModal = (title, formComponent) => {
    setModalState({ open: true, title: `Add New ${title}`, content: formComponent });
  };

  const handleCloseModal = () =>
    setModalState((prev) => ({ ...prev, open: false, title: '', content: null }));

  if (!selectedCompany) {
    return <DashboardLayout><div>Loading Company Data...</div></DashboardLayout>;
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="p-4 text-center">
            <h3 className="text-lg font-medium text-gray-900">No data available for {selectedCompany.name}</h3>
            <p className="text-gray-500">Please configure the dashboard data source.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Modal
        open={modalState.open}
        setOpen={(val) => setModalState((prev) => ({ ...prev, open: val }))}
        title={modalState.title}
      >
        {modalState.content}
      </Modal>

      <div className="space-y-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Dashboard Overview</h3>

          <Menu as="div" className="relative inline-block text-left">
            <div>
              <Menu.Button className="inline-flex w-full items-center justify-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                <PlusCircleIcon className="h-5 w-5" aria-hidden="true" />
                Add New
                <ChevronDownIcon className="ml-2 h-5 w-5 text-indigo-200" aria-hidden="true" />
              </Menu.Button>
            </div>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        type="button"
                        onClick={() => handleOpenModal('Sale', <SaleForm onSave={handleCloseModal} onCancel={handleCloseModal} />)}
                        className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-sm text-gray-700`}
                      >
                        Add Sale
                      </button>
                    )}
                  </Menu.Item>
                  {/* Add other menu items as needed */}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {data.stats.map((item) => {
            const Icon = iconMap[item.icon] || BanknotesIcon;
            return (
              <StatCard
                key={item.name}
                title={item.name}
                value={formatCurrency(item.value)}
                icon={Icon}
              />
            );
          })}
        </div>

        <div>
          <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">
            Financial Health Overview
          </h3>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ProfitabilityRatios data={data.profitability} />
            </div>
            <CurrentRatio data={data.currentRatio} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <TopExpenses data={data.topExpenses} />
          </div>
          <div className="lg:col-span-2">
            <RevenueSources data={data.revenueSources} />
          </div>
        </div>

        {/* Only render charts/tables if data exists to prevent crashes with empty mock data */}
        {data.revenueChart && (
             <div className="grid grid-cols-1 gap-5">
                <RevenueChart data={data.revenueChart} />
            </div>
        )}
       
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <DebtorsTable />
          <CreditorsTable />
        </div>
      </div>
    </DashboardLayout>
  );
}