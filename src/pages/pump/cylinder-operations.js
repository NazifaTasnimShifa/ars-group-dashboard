// src/pages/pump/cylinder-operations.js
// ARS Corporation - Gas Cylinder Operations Page

import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  CalendarDaysIcon, 
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon,
  CubeIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline';

// Cylinder types and initial stock
const CYLINDER_TYPES = [
  { id: 'LPG-12', name: '12 KG Domestic', category: 'domestic', weight: 12 },
  { id: 'LPG-35', name: '35 KG Commercial', category: 'commercial', weight: 35 },
  { id: 'LPG-45', name: '45 KG Industrial', category: 'industrial', weight: 45 },
];

const INITIAL_STOCK = {
  'LPG-12': { filled: 45, empty: 20 },
  'LPG-35': { filled: 12, empty: 8 },
  'LPG-45': { filled: 6, empty: 4 },
};

export default function CylinderOperationsPage() {
  const { formatCurrency } = useAppContext();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [stock, setStock] = useState(INITIAL_STOCK);
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('receive'); // receive, issue, swap

  // Calculate totals
  const totalFilled = Object.values(stock).reduce((sum, s) => sum + s.filled, 0);
  const totalEmpty = Object.values(stock).reduce((sum, s) => sum + s.empty, 0);

  // Handle stock adjustment
  const handleStockChange = (cylinderId, type, delta) => {
    setStock(prev => ({
      ...prev,
      [cylinderId]: {
        ...prev[cylinderId],
        [type]: Math.max(0, prev[cylinderId][type] + delta)
      }
    }));
  };

  // Record transaction
  const recordTransaction = (type, cylinderId, qty, notes) => {
    const newTx = {
      id: Date.now(),
      time: new Date().toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' }),
      type,
      cylinderId,
      cylinderName: CYLINDER_TYPES.find(c => c.id === cylinderId)?.name,
      qty,
      notes
    };
    setTransactions(prev => [newTx, ...prev]);
    
    // Update stock based on transaction type
    if (type === 'receive') {
      handleStockChange(cylinderId, 'filled', qty);
    } else if (type === 'issue') {
      handleStockChange(cylinderId, 'filled', -qty);
      handleStockChange(cylinderId, 'empty', qty);
    } else if (type === 'return') {
      handleStockChange(cylinderId, 'empty', -qty);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gas Cylinder Operations</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track cylinder receipts, issues, and swaps
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
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
            <p className="text-green-100 text-sm">Total Filled</p>
            <p className="text-3xl font-bold mt-1">{totalFilled}</p>
            <p className="text-green-200 text-xs">Ready for sale</p>
          </div>
          <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl p-5 text-white">
            <p className="text-gray-100 text-sm">Total Empty</p>
            <p className="text-3xl font-bold mt-1">{totalEmpty}</p>
            <p className="text-gray-200 text-xs">Awaiting refill</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
            <p className="text-blue-100 text-sm">Today&apos;s Issues</p>
            <p className="text-3xl font-bold mt-1">
              {transactions.filter(t => t.type === 'issue').reduce((sum, t) => sum + t.qty, 0)}
            </p>
            <p className="text-blue-200 text-xs">Cylinders sold</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white">
            <p className="text-amber-100 text-sm">Today&apos;s Receipts</p>
            <p className="text-3xl font-bold mt-1">
              {transactions.filter(t => t.type === 'receive').reduce((sum, t) => sum + t.qty, 0)}
            </p>
            <p className="text-amber-200 text-xs">Cylinders received</p>
          </div>
        </div>

        {/* Cylinder Stock Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Cylinder Inventory</h3>
            <div className="flex gap-2">
              <button
                onClick={() => { setModalType('receive'); setShowModal(true); }}
                className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                Receive
              </button>
              <button
                onClick={() => { setModalType('issue'); setShowModal(true); }}
                className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                <ArrowUpTrayIcon className="h-4 w-4 mr-1" />
                Issue/Sell
              </button>
              <button
                onClick={() => { setModalType('return'); setShowModal(true); }}
                className="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700"
              >
                <ArrowPathIcon className="h-4 w-4 mr-1" />
                Return Empty
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cylinder Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Filled Stock</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Empty Stock</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {CYLINDER_TYPES.map((cylinder) => {
                  const cylStock = stock[cylinder.id] || { filled: 0, empty: 0 };
                  return (
                    <tr key={cylinder.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-lg bg-cyan-100 flex items-center justify-center text-cyan-700">
                            <CubeIcon className="h-6 w-6" />
                          </div>
                          <span className="ml-3 font-medium text-gray-900">{cylinder.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cylinder.weight} KG
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          cylinder.category === 'domestic' ? 'bg-green-100 text-green-800' :
                          cylinder.category === 'commercial' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {cylinder.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleStockChange(cylinder.id, 'filled', -1)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="text-lg font-bold text-green-600 w-12">{cylStock.filled}</span>
                          <button
                            onClick={() => handleStockChange(cylinder.id, 'filled', 1)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleStockChange(cylinder.id, 'empty', -1)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="text-lg font-bold text-gray-600 w-12">{cylStock.empty}</span>
                          <button
                            onClick={() => handleStockChange(cylinder.id, 'empty', 1)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-lg font-bold text-gray-900">
                          {cylStock.filled + cylStock.empty}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-right font-semibold text-gray-700">
                    Total:
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-green-600">{totalFilled}</td>
                  <td className="px-6 py-4 text-center font-bold text-gray-600">{totalEmpty}</td>
                  <td className="px-6 py-4 text-center font-bold text-gray-900">{totalFilled + totalEmpty}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Today's Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Today&apos;s Transactions</h3>
          </div>
          <div className="p-4">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No transactions recorded today. Use the buttons above to record cylinder movements.
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div key={tx.id} className={`flex items-center justify-between p-3 rounded-lg ${
                    tx.type === 'receive' ? 'bg-green-50' :
                    tx.type === 'issue' ? 'bg-blue-50' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">{tx.time}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        tx.type === 'receive' ? 'bg-green-200 text-green-800' :
                        tx.type === 'issue' ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-800'
                      }`}>
                        {tx.type.toUpperCase()}
                      </span>
                      <span className="font-medium text-gray-900">{tx.cylinderName}</span>
                    </div>
                    <span className="font-bold text-gray-900">x{tx.qty}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
