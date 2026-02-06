// src/pages/pump/cylinder-operations.js
// ARS Corporation - Gas Cylinder Operations Page

import { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Modal from '@/components/ui/Modal';
import {
  CalendarDaysIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

// Helper function to determine category based on weight
function getCylinderCategory(weight) {
  const w = parseFloat(weight);
  if (w <= 15) return 'domestic';
  if (w <= 40) return 'commercial';
  return 'industrial';
}

function CylinderOperationsPage() {
  const { formatCurrency, authFetch, isAuthenticated, user, isSuperOwner } = useAppContext();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [cylinderTypes, setCylinderTypes] = useState([]);
  const [originalStock, setOriginalStock] = useState({});
  const [stock, setStock] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('receive'); // receive, issue, swap
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Calculate totals - ensuring we handle NaN/undefined
  const totalFilled = Object.values(stock).reduce((sum, s) => sum + (Number(s?.filled) || 0), 0);
  const totalEmpty = Object.values(stock).reduce((sum, s) => sum + (Number(s?.empty) || 0), 0);
  
  // Check if there are unsaved changes
  const hasChanges = JSON.stringify(stock) !== JSON.stringify(originalStock);

  // Role-based access: Only owners/admins can directly edit stock
  const canEditStock = isSuperOwner || ['ADMIN', 'SUPER_OWNER'].includes(user?.role?.name?.toUpperCase());

  const handleStockChange = (cylinderId, type, rawValue) => {
    const val = rawValue === '' ? 0 : parseInt(rawValue);
    const newValue = isNaN(val) ? 0 : Math.max(0, val);
    
    // Update local state immediately
    setStock(prev => ({
      ...prev,
      [cylinderId]: {
        ...(prev[cylinderId] || { filled: 0, empty: 0 }),
        [type]: newValue
      }
    }));
    
    // Clear any previous save error when user makes a new change
    if (saveError) setSaveError(null);
  };

  // Bulk save changes to the database
  const saveChanges = async () => {
    if (!hasChanges || isSaving) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // Find what changed
      const changes = [];
      for (const id in stock) {
        if (stock[id].filled !== originalStock[id]?.filled) {
          changes.push({ cylinderId: id, type: 'filled', quantity: stock[id].filled });
        }
        if (stock[id].empty !== originalStock[id]?.empty) {
          changes.push({ cylinderId: id, type: 'empty', quantity: stock[id].empty });
        }
      }

      if (changes.length === 0) {
        setOriginalStock({ ...stock });
        setIsSaving(false);
        return;
      }

      // We'll perform individual updates for now (or could add a bulk endpoint)
      // Since it's usually just a few rows, this is fine.
      const savePromises = changes.map(change => 
        authFetch('/api/pump/cylinders', {
          method: 'POST',
          body: JSON.stringify({ 
            action: 'set_stock',
            cylinderId: change.cylinderId, 
            type: change.type,
            quantity: change.quantity,
            businessId: currentBusiness?.id 
          })
        })
      );

      const results = await Promise.all(savePromises);
      const failed = results.filter(r => !r.ok);
      
      if (failed.length > 0) {
        throw new Error('Some changes failed to save');
      }

      // Success - update original stock to match current
      setOriginalStock({ ...stock });
      // Small visual feedback could be added here (toast)
    } catch (err) {
      console.error('Failed to save changes:', err);
      setSaveError("Failed to save some changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/pump/cylinders');
      const result = await res.json();
      if (result.success && result.data) {
        // Set cylinder types from database
        if (result.data.cylinderTypes && result.data.cylinderTypes.length > 0) {
          setCylinderTypes(result.data.cylinderTypes.map(ct => ({
            id: ct.id,
            name: ct.name,
            brand: ct.brand,
            weight: parseFloat(ct.weight),
            category: getCylinderCategory(ct.weight)
          })));
        }

        // Map API stock to local format
        const newStock = {};
        result.data.stocks.forEach(item => {
          newStock[item.cylinderTypeId] = {
            filled: Number(item.filledQty) || 0,
            empty: Number(item.emptyQty) || 0
          };
        });
        setStock(newStock);
        setOriginalStock(JSON.parse(JSON.stringify(newStock))); // Deep copy for comparison
        
        // Update transactions list from server
        if (result.data.transactions) {
          setTransactions(result.data.transactions);
        }
      }
    } catch (err) {
      console.error("Failed to fetch cylinder data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // Record transaction
  const recordTransaction = async (type, cylinderId, qty, notes) => {
    try {
      const res = await authFetch('/api/pump/cylinders', {
        method: 'POST',
        body: JSON.stringify({ type, cylinderId, quantity: qty, notes })
      });
      const result = await res.json();

      if (result.success) {
        // Update local UI
        const newTx = {
          id: Date.now(),
          time: new Date().toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' }),
          type,
          cylinderId,
          cylinderName: cylinderTypes.find(c => c.id === cylinderId)?.name,
          qty,
          notes
        };
        setTransactions(prev => [newTx, ...prev]);

        // Refresh stock from server to be sure
        fetchData();
      } else {
        alert(result.message || "Failed to record transaction");
      }
    } catch (err) {
      console.error("Transaction failed", err);
      alert("Transaction failed");
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
            {hasChanges && (
              <button
                onClick={saveChanges}
                disabled={isSaving}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all ${
                  isSaving 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                }`}
              >
                {isSaving ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            )}
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
        
        {saveError && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="ml-3 text-sm text-red-700">
                {saveError}
              </div>
            </div>
          </div>
        )}

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
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      Loading cylinder data...
                    </td>
                  </tr>
                ) : cylinderTypes.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No cylinder types configured. Please add cylinder types in the system settings.
                    </td>
                  </tr>
                ) : cylinderTypes.map((cylinder) => {
                  const cylStock = stock[cylinder.id] || { filled: 0, empty: 0 };
                  return (
                    <tr key={cylinder.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-lg bg-cyan-100 flex items-center justify-center text-cyan-700">
                            <CubeIcon className="h-6 w-6" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{cylinder.name}</div>
                            {cylinder.brand && (
                              <div className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">{cylinder.brand}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cylinder.weight} KG
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${cylinder.category === 'domestic' ? 'bg-green-100 text-green-800' :
                          cylinder.category === 'commercial' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                          {cylinder.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center relative group">
                        {canEditStock ? (
                          <div className="flex items-center justify-center">
                            <input
                              type="number"
                              min="0"
                              value={cylStock.filled}
                              onChange={(e) => handleStockChange(cylinder.id, 'filled', e.target.value)}
                              className={`w-20 text-center text-lg font-bold text-green-600 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                                stock[cylinder.id]?.filled !== originalStock[cylinder.id]?.filled ? 'bg-yellow-50 border-yellow-300' : ''
                              }`}
                            />
                          </div>
                        ) : (
                          <span className="text-lg font-bold text-green-600">{cylStock.filled}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center relative">
                        {canEditStock ? (
                          <div className="flex items-center justify-center">
                            <input
                              type="number"
                              min="0"
                              value={cylStock.empty}
                              onChange={(e) => handleStockChange(cylinder.id, 'empty', e.target.value)}
                              className={`w-20 text-center text-lg font-bold text-gray-600 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors ${
                                stock[cylinder.id]?.empty !== originalStock[cylinder.id]?.empty ? 'bg-yellow-50 border-yellow-300' : ''
                              }`}
                            />
                          </div>
                        ) : (
                          <span className="text-lg font-bold text-gray-600">{cylStock.empty}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-lg font-bold text-gray-900">
                          {(Number(cylStock.filled) || 0) + (Number(cylStock.empty) || 0)}
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
                  <td className="px-6 py-4 text-center font-bold text-green-600">{Number(totalFilled) || 0}</td>
                  <td className="px-6 py-4 text-center font-bold text-gray-600">{Number(totalEmpty) || 0}</td>
                  <td className="px-6 py-4 text-center font-bold text-gray-900">{(Number(totalFilled) || 0) + (Number(totalEmpty) || 0)}</td>
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
                  <div key={tx.id} className={`flex items-center justify-between p-3 rounded-lg ${tx.type === 'receive' ? 'bg-green-50' :
                    tx.type === 'issue' ? 'bg-blue-50' : 'bg-gray-50'
                    }`}>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">{tx.time}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${tx.type === 'receive' ? 'bg-green-200 text-green-800' :
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
      {/* Transaction Modal */}
      <Modal
        open={showModal}
        setOpen={setShowModal}
        title={`${modalType === 'receive' ? 'Receive' : modalType === 'issue' ? 'Issue/Sell' : 'Return Empty'} Cylinders`}
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          recordTransaction(
            modalType,
            formData.get('cylinderId'),
            Number(formData.get('quantity')),
            formData.get('notes')
          );
          setShowModal(false);
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Cylinder Type</label>
            <select name="cylinderId" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
              {cylinderTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.brand ? `[${type.brand}] ` : ''}{type.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              name="quantity"
              required
              min="1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <input
              type="text"
              name="notes"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );

}

export default CylinderOperationsPage;
