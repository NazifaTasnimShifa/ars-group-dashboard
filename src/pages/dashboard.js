// src/pages/dashboard.js
// ARS ERP - Main Dashboard with Owner View Support

import { useState, useEffect, useCallback, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { useAppContext } from '@/contexts/AppContext';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Owner Dashboard Components
import { CashPulseCard, OperationalSnapshot, LiabilityWatch, CompanyBreakdown } from '@/components/owner-dashboard';

// Existing Dashboard Components
import StatCard from '@/components/dashboard/StatCard';
import ProfitabilityRatios from '@/components/dashboard/ProfitabilityRatios';
import CurrentRatio from '@/components/dashboard/CurrentRatio';
import TopExpenses from '@/components/dashboard/TopExpenses';
import RevenueSources from '@/components/dashboard/RevenueSources';
import RevenueChart from '@/components/dashboard/RevenueChart';
import DebtorsTable from '@/components/dashboard/DebtorsTable';
import CreditorsTable from '@/components/dashboard/CreditorsTable';
import CashFlowSummary from '@/components/dashboard/CashFlowSummary';
import SalesPerformance from '@/components/dashboard/SalesPerformance';
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
  BuildingOffice2Icon,
  GlobeAltIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

const iconMap = {
  BanknotesIcon,
  ArrowUpIcon,
  ArrowDownIcon,
};

export default function DashboardPage() {
  const [modalState, setModalState] = useState({ open: false, title: '', content: null });
  const {
    user,
    currentBusiness,
    businesses,
    switchBusiness,
    isSuperOwner,
    isViewingAllBusinesses,
    formatCurrency,
    formatDate,
    loading: authLoading,
    authFetch
  } = useAppContext();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // --- 1. Fetch Dashboard Data ---
  const fetchDashboardData = useCallback(async () => {
    if (authLoading) return;
    setLoading(true);
    try {
      let url = '/api/dashboard';
      if (currentBusiness) {
        url += `?businessId=${currentBusiness.id}`;
      } else if (isSuperOwner) {
        url += '?viewAll=true';
      }

      const res = await authFetch(url);
      const fetchedData = await res.json();
      if (fetchedData.success) {
        setData(fetchedData.data);
      } else {
        console.error("Dashboard API failed:", fetchedData.error);
        setData({}); // Set empty to avoid null check locking UI
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
      setData({});
    } finally {
      setLoading(false);
    }
  }, [currentBusiness, isSuperOwner, authLoading, authFetch]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  // --- 2. Generic Save Handler ---
  const handleSave = async (type, formData) => {
    // Determine which business to use
    let businessToUse = currentBusiness;
    if (!businessToUse && isSuperOwner && businesses.length > 0) {
      businessToUse = businesses[0]; // Use first business as fallback for super owner
    }
    
    if (!businessToUse) {
      alert('Please select a company first');
      return;
    }

    let url = '';
    let payload = { ...formData };
    
    // Set company_id (API expects company_id, not businessId)
    payload.company_id = businessToUse.id;

    switch (type) {
      case 'sales': url = '/api/sales'; break;
      case 'purchases': url = '/api/purchases'; break;
      case 'inventory': url = '/api/inventory'; break;
      case 'debtors': url = '/api/debtors'; break;
      case 'creditors': url = '/api/creditors'; break;
      default: alert('Unknown data type'); return;
    }

    try {
      const res = await authFetch(url, {
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
  const openModal = (type) => {
    let title = '';
    let FormComponent = null;
    let dataType = '';

    switch (type) {
      case 'sale': title = 'Record New Sale'; dataType = 'sales'; FormComponent = SaleForm; break;
      case 'purchase': title = 'Record Purchase Order'; dataType = 'purchases'; FormComponent = PurchaseOrderForm; break;
      case 'product': title = 'Add Inventory Item'; dataType = 'inventory'; FormComponent = InventoryItemForm; break;
      case 'debtor': title = 'Add Customer'; dataType = 'debtors'; FormComponent = DebtorForm; break;
      case 'creditor': title = 'Add Supplier'; dataType = 'creditors'; FormComponent = CreditorForm; break;
      default: return;
    }

    setModalState({
      open: true,
      title,
      content: <FormComponent onSave={(data) => handleSave(dataType, data)} onCancel={handleCloseModal} />
    });
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Modal open={modalState.open} setOpen={(val) => setModalState((prev) => ({ ...prev, open: val }))} title={modalState.title}>
        {modalState.content}
      </Modal>

      <div className="space-y-6">
        {/* Header with Switcher - Always Visible */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {isSuperOwner ? 'Owner Dashboard' : (currentBusiness?.name || 'Dashboard')}
            </h3>
            {isSuperOwner && (
              <p className="mt-1 text-sm text-gray-500">
                {isViewingAllBusinesses ? 'Combined view of all companies' : `Viewing: ${currentBusiness?.name || 'Select a company'}`}
              </p>
            )}
          </div>

          <div className="mt-4 sm:mt-0 flex items-center gap-3">
            <div className="flex items-center bg-white rounded-md border border-gray-300 px-3 py-2">
              <CalendarDaysIcon className="h-5 w-5 text-gray-400 mr-2" />
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="text-sm text-gray-700 border-0 focus:ring-0 p-0" />
            </div>

            {isSuperOwner && (
              <Menu as="div" className="relative inline-block text-left">
                <Menu.Button className="inline-flex items-center gap-x-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                  {isViewingAllBusinesses ? (
                    <><GlobeAltIcon className="h-5 w-5 text-indigo-500" /> All Companies</>
                  ) : (
                    <><BuildingOffice2Icon className="h-5 w-5 text-gray-400" /> {currentBusiness?.shortName || 'Select Company'}</>
                  )}
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                </Menu.Button>
                <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button onClick={() => switchBusiness('all')} className={`${active ? 'bg-gray-100' : ''} ${isViewingAllBusinesses ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'} flex w-full items-center px-4 py-2 text-sm`}>
                            <GlobeAltIcon className="mr-3 h-5 w-5" /> All Companies
                          </button>
                        )}
                      </Menu.Item>
                      <div className="border-t border-gray-100 my-1"></div>
                      {businesses.map((business) => (
                        <Menu.Item key={business.id}>
                          {({ active }) => (
                            <button onClick={() => switchBusiness(business.id)} className={`${active ? 'bg-gray-100' : ''} ${currentBusiness?.id === business.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'} flex w-full items-center px-4 py-2 text-sm`}>
                              <BuildingOffice2Icon className="mr-3 h-5 w-5" /> {business.name}
                            </button>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            )}

            <Menu as="div" className="relative inline-block text-left">
              <Menu.Button className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                <PlusCircleIcon className="h-5 w-5" /> Add New <ChevronDownIcon className="h-5 w-5 text-indigo-200" />
              </Menu.Button>
              <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
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
        </div>

        {/* Content Section */}
        {loading && !data ? (
          <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
        ) : (
          <>
            {isSuperOwner && (
              <>
                <CashPulseCard data={data.cashPulse} formatCurrency={formatCurrency} />
                <OperationalSnapshot data={data.operationalSnapshot} formatCurrency={formatCurrency} />
                <LiabilityWatch data={data.liabilityWatch} formatCurrency={formatCurrency} />
                {isViewingAllBusinesses && <CompanyBreakdown companies={data.companies} formatCurrency={formatCurrency} />}
              </>
            )}

            {(!isSuperOwner || currentBusiness) && data.stats && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {data.stats.map((item) => {
                  const Icon = iconMap[item.icon] || BanknotesIcon;
                  return <StatCard key={item.name} title={item.name} value={formatCurrency(item.value)} icon={Icon} />;
                })}
              </div>
            )}

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
          </>
        )}

        {/* Financial Cards Grid */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <DebtorsTable />
          <CreditorsTable />
        </div>
        
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <CashFlowSummary />
          <SalesPerformance />
        </div>
      </div>
    </DashboardLayout>
  );
}
