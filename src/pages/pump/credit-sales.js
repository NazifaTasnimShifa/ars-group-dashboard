// src/pages/pump/credit-sales.js
// ARS Corporation - Credit Sales Management

import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Modal from '@/components/ui/Modal';
import SaleForm from '@/components/forms/SaleForm';
import PaymentForm from '@/components/forms/PaymentForm';
import {
  CalendarDaysIcon,
  UserGroupIcon,
  PlusIcon,
  BanknotesIcon,
  ClockIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

export default function CreditSalesPage() {
  const { formatCurrency, authFetch, currentBusiness } = useAppContext();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('sales');
  // Modal state: type can be 'creditSale' or 'receivePayment'
  const [modalState, setModalState] = useState({ open: false, title: '', type: null, data: null });
  const [salesData, setSalesData] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch credit sales from API
  const fetchSales = useCallback(async () => {
    if (!currentBusiness?.id) return;

    try {
      // Fetch sales with Credit payment method
      const res = await authFetch(`/api/sales?company_id=${currentBusiness.id}&date=${selectedDate}&paymentMethod=Credit`);
      const result = await res.json();

      if (result.success) {
        setSalesData(result.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch sales:', err);
    }
  }, [authFetch, currentBusiness?.id, selectedDate]);

  // Fetch Credit Customers (Debtors)
  const fetchCustomers = useCallback(async () => {
    if (!currentBusiness?.id) return;

    try {
      const res = await authFetch(`/api/debtors?company_id=${currentBusiness.id}`);
      const result = await res.json();

      if (result.success) {
        setCustomers(result.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    }
  }, [authFetch, currentBusiness?.id]);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchSales(), fetchCustomers()]);
    setLoading(false);
  }, [fetchSales, fetchCustomers]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Calculate totals
  const todayTotal = salesData.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
  // Total Outstanding from DB (sum of all debtors' current amount)
  const totalOutstanding = customers.reduce((sum, c) => sum + Number(c.amount || 0), 0);
  
  // Default limit assumption for UI visualization (per customer)
  const VISUAL_LIMIT_THRESHOLD = 500000; 

  // Modal handlers
  const openModal = (type, title, data = null) => {
    setModalState({ open: true, title, type, data });
  };

  const closeModal = () => {
    setModalState({ open: false, title: '', type: null, data: null });
  };

  const handleSaleSave = async (data) => {
    try {
      const res = await authFetch('/api/sales', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          company_id: currentBusiness?.id,
          paymentMethod: 'Credit' // Force credit payment for credit sales
        })
      });
      const result = await res.json();
      if (result.success) {
        alert('Credit sale recorded successfully!');
        closeModal();
        fetchAllData(); // Refresh data
      } else {
        alert(result.message || 'Failed to save');
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save. Please try again.');
    }
  };

  const handlePaymentSave = async (data) => {
    try {
      const res = await authFetch('/api/sales/payment', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          companyId: currentBusiness?.id
        })
      });
      const result = await res.json();
      if (result.success) {
        alert('Payment recorded successfully!');
        closeModal();
        fetchAllData(); // Refresh all data (sales might be affected if we log it, and customer balance definitely)
      } else {
        alert(result.message || 'Failed to save payment');
      }
    } catch (err) {
      console.error('Payment Save error:', err);
      alert('Failed to save payment. Please try again.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Credit Sales Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track credit customers and their outstanding balances
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center gap-3">
            <div className="flex items-center bg-white rounded-lg border border-gray-300 px-3 py-2 shadow-sm">
              <CalendarDaysIcon className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-sm text-gray-700 border-0 focus:ring-0 p-0 bg-transparent"
              />
            </div>
            <button
              onClick={() => openModal('creditSale', 'New Credit Sale')}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700"
            >
              <PlusIcon className="h-5 w-5 mr-1" />
              New Credit Sale
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
            <p className="text-blue-100 text-sm">Today&apos;s Credit Sales</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(todayTotal)}</p>
            <p className="text-blue-200 text-xs">{salesData.length} transactions</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white">
            <p className="text-red-100 text-sm">Total Outstanding</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(totalOutstanding)}</p>
            <p className="text-red-200 text-xs">All customers</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white">
            <p className="text-amber-100 text-sm">Active Customers</p>
            <p className="text-2xl font-bold mt-1">{customers.length}</p>
            <p className="text-amber-200 text-xs">With credit facility</p>
          </div>
           {/* Placeholder for future stat */}
           <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
            <p className="text-green-100 text-sm">Collections Today</p>
            <p className="text-2xl font-bold mt-1">
                 {/* TODO: Add Logic to fetch today's collections */}
                 --
            </p>
            <p className="text-green-200 text-xs">To be implemented</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('sales')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'sales'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Today&apos;s Sales
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'customers'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Credit Customers
            </button>
          </nav>
        </div>

        {/* Today's Sales Tab */}
        {activeTab === 'sales' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fuel</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Litres</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : salesData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        No credit sales found for this date.
                      </td>
                    </tr>
                  ) : (
                    salesData.map((sale) => (
                      <tr key={sale.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <ClockIcon className="h-4 w-4 inline mr-1" />
                          {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {sale.customer || sale.customerName || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sale.vehicleNumber || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sale.items?.map(i => i.productName).join(', ') || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-mono">
                          {sale.items?.reduce((sum, i) => sum + i.quantity, 0).toFixed(2) || '0.00'} L
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                          {formatCurrency(sale.totalAmount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-right font-semibold text-gray-700">
                      Total:
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      {salesData.reduce((sum, sale) => sum + (sale.items?.reduce((s, i) => s + i.quantity, 0) || 0), 0).toFixed(2)} L
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-indigo-600">
                      {formatCurrency(todayTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customers.map((customer) => {
              const outstanding = Number(customer.amount || 0);
              const utilization = Math.min((outstanding / VISUAL_LIMIT_THRESHOLD) * 100, 100);
              const isHigh = utilization > 80;

              return (
                <div key={customer.id} className={`bg-white rounded-xl shadow-sm border p-5 ${isHigh ? 'border-red-200' : 'border-gray-200'
                  }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <UserGroupIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{customer.name}</h3>
                        <p className="text-xs text-gray-500">
                          {customer.phone ? customer.phone : 'No Phone'}
                        </p>
                      </div>
                    </div>
                    {isHigh && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                        <ExclamationCircleIcon className="h-3 w-3 mr-1" />
                        High Due
                      </span>
                    )}
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Estimated Limit Usage</span>
                      <span className="font-medium text-gray-900">{utilization.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${isHigh ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${utilization}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-500">Outstanding</p>
                      <p className="font-bold text-red-600 text-lg">{formatCurrency(outstanding)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Last Payment</p>
                      <p className="font-medium text-gray-900">
                        {/* If we had last payment date in API, we'd show it here. For now, showing 'Paid Amount' or similar might be useful, or just N/A */}
                        {customer.updatedAt ? new Date(customer.updatedAt).toLocaleDateString() : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal('receivePayment', 'Receive Payment', customer)}
                      className="flex-1 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 shadow-sm"
                    >
                      <BanknotesIcon className="h-4 w-4 inline mr-1" />
                      Receive
                    </button>
                    <button
                      onClick={() => openModal('creditSale', 'New Sale for ' + customer.name, customer)}
                      className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 shadow-sm"
                    >
                      <PlusIcon className="h-4 w-4 inline mr-1" />
                      New Sale
                    </button>
                  </div>
                </div>
              );
            })}
             {customers.length === 0 && !loading && (
              <div className="col-span-full py-10 text-center text-gray-500">
                No credit customers found. Add them in the Accounts section.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Handling */}
      <Modal open={modalState.open} setOpen={closeModal} title={modalState.title}>
        {modalState.type === 'creditSale' && (
          <SaleForm 
            onSave={handleSaleSave} 
            onCancel={closeModal} 
            initialCustomer={modalState.data} // Pre-fill customer if available
          />
        )}
        {modalState.type === 'receivePayment' && (
          <PaymentForm 
            customer={modalState.data}
            onSave={handlePaymentSave}
            onCancel={closeModal}
          />
        )}
      </Modal>
    </DashboardLayout>
  );
}
