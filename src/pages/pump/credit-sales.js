// src/pages/pump/credit-sales.js
// ARS Corporation - Credit Sales Management

import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  CalendarDaysIcon, 
  UserGroupIcon,
  PlusIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

// Demo credit customers
const CREDIT_CUSTOMERS = [
  { id: 'C1', name: 'Bangladesh Army Camp', limit: 500000, used: 325000, lastPayment: '10/12/2024' },
  { id: 'C2', name: 'Dhaka Transport Co.', limit: 300000, used: 280000, lastPayment: '05/12/2024' },
  { id: 'C3', name: 'City Bus Service', limit: 250000, used: 120000, lastPayment: '12/12/2024' },
  { id: 'C4', name: 'Metro Construction Ltd', limit: 400000, used: 150000, lastPayment: '08/12/2024' },
  { id: 'C5', name: 'ABC Logistics', limit: 200000, used: 195000, lastPayment: '01/12/2024' },
];

// Demo credit sales today
const TODAY_SALES = [
  { id: 1, time: '08:30', customer: 'Bangladesh Army Camp', fuelType: 'Diesel', litres: 500, amount: 57500, vehicle: 'BA-12345' },
  { id: 2, time: '09:15', customer: 'Dhaka Transport Co.', fuelType: 'Diesel', litres: 200, amount: 23000, vehicle: 'DT-5678' },
  { id: 3, time: '11:45', customer: 'City Bus Service', fuelType: 'Diesel', litres: 300, amount: 34500, vehicle: 'CBS-001' },
  { id: 4, time: '14:20', customer: 'Metro Construction Ltd', fuelType: 'Petrol', litres: 100, amount: 13000, vehicle: 'MC-9090' },
];

export default function CreditSalesPage() {
  const { formatCurrency } = useAppContext();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('sales'); // sales, customers

  // Calculate totals
  const todayTotal = TODAY_SALES.reduce((sum, s) => sum + s.amount, 0);
  const totalOutstanding = CREDIT_CUSTOMERS.reduce((sum, c) => sum + c.used, 0);
  const totalLimit = CREDIT_CUSTOMERS.reduce((sum, c) => sum + c.limit, 0);

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
            <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700">
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
            <p className="text-blue-200 text-xs">{TODAY_SALES.length} transactions</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white">
            <p className="text-red-100 text-sm">Total Outstanding</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(totalOutstanding)}</p>
            <p className="text-red-200 text-xs">All customers</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white">
            <p className="text-amber-100 text-sm">Credit Utilization</p>
            <p className="text-2xl font-bold mt-1">{((totalOutstanding / totalLimit) * 100).toFixed(0)}%</p>
            <p className="text-amber-200 text-xs">of total limit</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
            <p className="text-green-100 text-sm">Active Customers</p>
            <p className="text-2xl font-bold mt-1">{CREDIT_CUSTOMERS.length}</p>
            <p className="text-green-200 text-xs">With credit facility</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('sales')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sales'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Today&apos;s Sales
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'customers'
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
                  {TODAY_SALES.map((sale) => (
                    <tr key={sale.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <ClockIcon className="h-4 w-4 inline mr-1" />
                        {sale.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {sale.customer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sale.vehicle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          sale.fuelType === 'Diesel' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {sale.fuelType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono">
                        {sale.litres} L
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                        {formatCurrency(sale.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-right font-semibold text-gray-700">
                      Total:
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      {TODAY_SALES.reduce((s, r) => s + r.litres, 0)} L
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
            {CREDIT_CUSTOMERS.map((customer) => {
              const utilization = (customer.used / customer.limit) * 100;
              const isNearLimit = utilization > 80;
              
              return (
                <div key={customer.id} className={`bg-white rounded-xl shadow-sm border p-5 ${
                  isNearLimit ? 'border-red-200' : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <UserGroupIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{customer.name}</h3>
                        <p className="text-xs text-gray-500">Last payment: {customer.lastPayment}</p>
                      </div>
                    </div>
                    {isNearLimit && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                        Near Limit
                      </span>
                    )}
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Credit Used</span>
                      <span className="font-medium text-gray-900">{utilization.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${isNearLimit ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${utilization}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Outstanding</p>
                      <p className="font-bold text-red-600">{formatCurrency(customer.used)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Credit Limit</p>
                      <p className="font-bold text-gray-900">{formatCurrency(customer.limit)}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700">
                      <BanknotesIcon className="h-4 w-4 inline mr-1" />
                      Receive Payment
                    </button>
                    <button className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
                      <PlusIcon className="h-4 w-4 inline mr-1" />
                      New Sale
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
