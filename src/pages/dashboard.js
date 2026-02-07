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

// ... imports
import DateRangeFilter from '@/components/ui/DateRangeFilter';

// ...

export default function DashboardPage() {
  const [modalState, setModalState] = useState({ open: false, title: '', content: null });
  const {
    // ... context
    user, currentBusiness, businesses, switchBusiness, isSuperOwner, isViewingAllBusinesses, formatCurrency, loading: authLoading, authFetch
  } = useAppContext(); // Removed unused formatDate

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  // --- 1. Fetch Dashboard Data ---
  const fetchDashboardData = useCallback(async (range = dateRange) => {
    if (authLoading) return;
    setLoading(true);
    try {
      let url = '/api/dashboard';
      const params = new URLSearchParams();

      if (currentBusiness) params.append('company_id', currentBusiness.id);
      else if (isSuperOwner) params.append('viewAll', 'true');

      if (range.startDate && range.endDate) {
        params.append('startDate', range.startDate);
        params.append('endDate', range.endDate);
      }

      const res = await authFetch(`${url}?${params.toString()}`);
      const fetchedData = await res.json();
      if (fetchedData.success) {
        setData(fetchedData.data);
      } else {
        console.error("Dashboard API failed:", fetchedData.error);
        setData({});
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
      setData({});
    } finally {
      setLoading(false);
    }
  }, [currentBusiness, isSuperOwner, authLoading, authFetch, dateRange]);

  // Initial load handled by Filter component's effect? 
  // DateRangeFilter calls onFilterChange on mount. So we don't need explicit useEffect for fetch here IF we pass handleFilterChange.
  // BUT DateRangeFilter only calls onFilterChange on mount if initialRange is set.
  // The existing pattern in other pages is:
  // DateRangeFilter loads -> calls onFilterChange -> updates state -> calls fetchData.
  // So we REMOVE the explicit useEffect(() => { fetchDashboardData() }, ...) to avoid double calling.


  const handleFilterChange = (range) => {
    setDateRange(range);
    fetchDashboardData(range);
  };

  // Modal handlers
  const openModal = (type) => {
    const formConfig = {
      sale: { title: 'Add Sale Invoice', component: SaleForm },
      purchase: { title: 'Add Purchase Order', component: PurchaseOrderForm },
      product: { title: 'Add Inventory Item', component: InventoryItemForm },
      debtor: { title: 'Add Customer / Debtor', component: DebtorForm },
      creditor: { title: 'Add Supplier / Creditor', component: CreditorForm },
    };
    const config = formConfig[type];
    if (config) {
      setModalState({ open: true, title: config.title, content: type });
    }
  };

  const closeModal = () => {
    setModalState({ open: false, title: '', content: null });
  };

  const handleSave = async (formData) => {
    // Handle form submission - submit to the correct API based on modal type
    try {
      let endpoint = '';
      let method = 'POST';
      
      switch (modalState.content) {
        case 'sale':
          endpoint = '/api/sales';
          break;
        case 'purchase':
          endpoint = '/api/purchases';
          break;
        case 'product':
          endpoint = '/api/inventory';
          break;
        case 'debtor':
          endpoint = '/api/debtors';
          break;
        case 'creditor':
          endpoint = '/api/creditors';
          break;
        default:
          console.error('Unknown modal type:', modalState.content);
          return;
      }
      
      // Add company_id to form data
      const payload = {
        ...formData,
        company_id: currentBusiness?.id
      };
      
      const res = await authFetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        closeModal();
        fetchDashboardData(dateRange); // Refresh dashboard data
      } else {
        const errorData = await res.json();
        alert(`Failed to save: ${errorData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Error saving data. Please try again.');
    }
  };

  const renderModalContent = () => {
    switch (modalState.content) {
      case 'sale':
        return <SaleForm onSave={handleSave} onCancel={closeModal} />;
      case 'purchase':
        return <PurchaseOrderForm onSave={handleSave} onCancel={closeModal} />;
      case 'product':
        return <InventoryItemForm onSave={handleSave} onCancel={closeModal} />;
      case 'debtor':
        return <DebtorForm onSave={handleSave} onCancel={closeModal} />;
      case 'creditor':
        return <CreditorForm onSave={handleSave} onCancel={closeModal} />;
      default:
        return null;
    }
  };
  // ... render ...

  // ... render ... 
  
  return (
    <DashboardLayout>
      {/* Modal for Add New Items */}
      <Modal open={modalState.open} setOpen={closeModal} title={modalState.title}>
        {renderModalContent()}
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
            {/* Replaced Date Input with Global Filter */}
            <DateRangeFilter onFilterChange={handleFilterChange} />

            {isSuperOwner && (
              <Menu as="div" className="relative inline-block text-left">
                {/* ... existing menu ... */}
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
              {/* ... Add New button ... */}
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
        {loading ? (
          <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
        ) : !data ? (
          <div className="text-center py-10 text-gray-500">No data available.</div>
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
          {data?.cashFlow && <CashFlowSummary data={data.cashFlow} />}
          {data?.salesPerformance && (
            <SalesPerformance
              achieved={data.salesPerformance.achieved}
              target={data.salesPerformance.target}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
