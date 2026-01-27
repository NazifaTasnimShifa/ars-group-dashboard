// src/pages/dashboard.js

import { useState, useEffect, useCallback, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { useAppContext } from '@/contexts/AppContext';
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

// Forms
import SaleForm from '@/components/forms/SaleForm';
import PurchaseOrderForm from '@/components/forms/PurchaseOrderForm';
import InventoryItemForm from '@/components/forms/InventoryItemForm';
import DebtorForm from '@/components/forms/DebtorForm';
import CreditorForm from '@/components/forms/CreditorForm';

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
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (value) => `৳${(value ?? 0).toLocaleString('en-IN')}`;

  // --- 1. Fetch Dashboard Data ---
  const fetchDashboardData = useCallback(async () => {
    if (!selectedCompany) return;
    setLoading(true);
    try {
        const res = await fetch(`/api/dashboard?company_id=${selectedCompany.id}`);
        const fetchedData = await res.json();
        if (fetchedData.success) {
            setData(fetchedData.data);
        }
    } catch (err) {
        console.error("Failed to fetch dashboard data", err);
    } finally {
        setLoading(false);
    }
  }, [selectedCompany]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  // --- 2. Generic Save Handler for All Forms ---
  const handleSave = async (type, formData) => {
    let url = '';
    let payload = { ...formData, company_id: selectedCompany.id };

    // Determine URL and ID logic based on type
    switch (type) {
        case 'sales':
            url = '/api/sales';
            payload.id = `INV-${Date.now()}`;
            break;
        case 'purchases':
            url = '/api/purchases';
            payload.id = `PO-${Date.now()}`;
            break;
        case 'inventory':
            url = '/api/inventory';
            payload.id = `ITM-${Date.now()}`;
            break;
        case 'debtors':
            url = '/api/debtors';
            // ID is auto-increment, do not send it
            delete payload.id;
            break;
        case 'creditors':
            url = '/api/creditors';
            // ID is auto-increment, do not send it
            delete payload.id;
            break;
        default:
            alert('Unknown data type');
            return;
    }

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            setModalState((prev) => ({ ...prev, open: false }));
            alert('Saved successfully!');
            fetchDashboardData(); 
        } else {
            const err = await res.json();
            alert(`Failed to save: ${err.error || err.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error(error);
        alert('An error occurred while saving.');
    }
  };

  const handleCloseModal = () => setModalState((prev) => ({ ...prev, open: false }));

  // --- 3. Helper to Open Specific Forms ---
  const openModal = (type) => {
    let title = '';
    let FormComponent = null;
    let dataType = '';

    switch (type) {
        case 'sale':
            title = 'Record New Sale';
            dataType = 'sales';
            FormComponent = SaleForm;
            break;
        case 'purchase':
            title = 'Record Purchase Order';
            dataType = 'purchases';
            FormComponent = PurchaseOrderForm;
            break;
        case 'product':
            title = 'Add Inventory Item';
            dataType = 'inventory';
            FormComponent = InventoryItemForm;
            break;
        case 'debtor':
            title = 'Add Customer (Debtor)';
            dataType = 'debtors';
            FormComponent = DebtorForm;
            break;
        case 'creditor':
            title = 'Add Supplier (Creditor)';
            dataType = 'creditors';
            FormComponent = CreditorForm;
            break;
        default: return;
    }

    setModalState({
        open: true,
        title,
        content: (
            <FormComponent 
                onSave={(data) => handleSave(dataType, data)} 
                onCancel={handleCloseModal} 
            />
        )
    });
  };

  if (!selectedCompany) return <DashboardLayout><div>Loading...</div></DashboardLayout>;
  if (loading && !data) return <DashboardLayout><div>Loading Dashboard...</div></DashboardLayout>;

  // Fallback if data is missing or empty
  if (!data || Object.keys(data).length === 0) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center">
            <h3 className="text-xl font-bold text-gray-900">Welcome to {selectedCompany.name}</h3>
            <p className="text-gray-500 mt-2">Your dashboard is ready. Start by adding some data!</p>
            <div className="mt-6 flex justify-center gap-4">
                <button onClick={() => openModal('sale')} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500">Add Sale</button>
                <button onClick={() => openModal('product')} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">Add Product</button>
            </div>
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

          {/* --- Add New Dropdown --- */}
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
              <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="py-1">
                  <Menu.Item>{({ active }) => <button onClick={() => openModal('sale')} className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-sm text-gray-700`}>Add Sale Invoice</button>}</Menu.Item>
                  <Menu.Item>{({ active }) => <button onClick={() => openModal('purchase')} className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-sm text-gray-700`}>Add Purchase Order</button>}</Menu.Item>
                  <Menu.Item>{({ active }) => <button onClick={() => openModal('product')} className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-sm text-gray-700`}>Add Inventory Item</button>}</Menu.Item>
                  <div className="border-t border-gray-100 my-1"></div>
                  <Menu.Item>{({ active }) => <button onClick={() => openModal('debtor')} className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-sm text-gray-700`}>Add Customer</button>}</Menu.Item>
                  <Menu.Item>{({ active }) => <button onClick={() => openModal('creditor')} className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-sm text-gray-700`}>Add Supplier</button>}</Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {data.stats?.map((item) => {
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

        {/* Rest of Dashboard */}
        <div>
          <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">Financial Health Overview</h3>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">{data.profitability && <ProfitabilityRatios data={data.profitability} />}</div>
            {data.currentRatio && <CurrentRatio data={data.currentRatio} />}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          <div className="lg:col-span-3">{data.topExpenses && <TopExpenses data={data.topExpenses} />}</div>
          <div className="lg:col-span-2">{data.revenueSources && <RevenueSources data={data.revenueSources} />}</div>
        </div>

        <div className="grid grid-cols-1 gap-5">
            <RevenueChart chartData={data.revenueChart} />
        </div>
       
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <DebtorsTable />
          <CreditorsTable />
        </div>
      </div>
    </DashboardLayout>
  );
}