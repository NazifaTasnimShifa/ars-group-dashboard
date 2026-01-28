// src/pages/pump/daily-operations.js
// ARS Corporation - Daily Pump Operations Page

import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  CalendarDaysIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// Demo data for fuel pumps
const DEMO_PUMPS = [
  { id: 'P1', name: 'Pump 1', fuelType: 'Petrol', openingReading: 125432.5, closingReading: null },
  { id: 'P2', name: 'Pump 2', fuelType: 'Petrol', openingReading: 98765.2, closingReading: null },
  { id: 'P3', name: 'Pump 3', fuelType: 'Diesel', openingReading: 234567.8, closingReading: null },
  { id: 'P4', name: 'Pump 4', fuelType: 'Diesel', openingReading: 167890.3, closingReading: null },
  { id: 'P5', name: 'Pump 5', fuelType: 'Octane', openingReading: 45678.1, closingReading: null },
];

const FUEL_PRICES = {
  'Petrol': 130.00,
  'Diesel': 115.00,
  'Octane': 135.00
};

export default function DailyOperationsPage() {
  const { formatCurrency, currentBusiness, isSuperOwner } = useAppContext();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dayStatus, setDayStatus] = useState('open'); // open, closed
  const [pumps, setPumps] = useState(DEMO_PUMPS);
  const [loading, setLoading] = useState(false);

  // Calculate totals
  const totals = pumps.reduce((acc, pump) => {
    if (pump.closingReading && pump.openingReading) {
      const litres = pump.closingReading - pump.openingReading;
      const amount = litres * FUEL_PRICES[pump.fuelType];
      acc.litres += litres;
      acc.amount += amount;
    }
    return acc;
  }, { litres: 0, amount: 0 });

  // Handle meter reading change
  const handleReadingChange = (pumpId, value) => {
    setPumps(prev => prev.map(p => 
      p.id === pumpId 
        ? { ...p, closingReading: value ? parseFloat(value) : null }
        : p
    ));
  };

  // Close day
  const handleCloseDay = () => {
    const unclosed = pumps.filter(p => !p.closingReading);
    if (unclosed.length > 0) {
      alert(`Please enter closing readings for: ${unclosed.map(p => p.name).join(', ')}`);
      return;
    }
    setDayStatus('closed');
    alert('Day closed successfully! All readings recorded.');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daily Pump Operations</h1>
            <p className="mt-1 text-sm text-gray-500">
              Record meter readings, sales, and close the day
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center gap-3">
            {/* Date Selector */}
            <div className="flex items-center bg-white rounded-lg border border-gray-300 px-3 py-2 shadow-sm">
              <CalendarDaysIcon className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-sm text-gray-700 border-0 focus:ring-0 p-0 bg-transparent"
              />
            </div>
            
            {/* Day Status Badge */}
            <div className={`flex items-center px-3 py-2 rounded-lg ${
              dayStatus === 'open' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {dayStatus === 'open' ? (
                <>
                  <ClockIcon className="h-5 w-5 mr-2" />
                  Day Open
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Day Closed
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white">
            <p className="text-amber-100 text-sm">Total Fuel Sold</p>
            <p className="text-2xl font-bold mt-1">{totals.litres.toFixed(2)} L</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
            <p className="text-green-100 text-sm">Total Sales Value</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(totals.amount)}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
            <p className="text-blue-100 text-sm">Pumps Completed</p>
            <p className="text-2xl font-bold mt-1">
              {pumps.filter(p => p.closingReading).length} / {pumps.length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
            <p className="text-purple-100 text-sm">Cash Collection</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(totals.amount * 0.85)}</p>
            <p className="text-purple-200 text-xs">Est. after credit</p>
          </div>
        </div>

        {/* Pump Readings Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Pump Meter Readings</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pump
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fuel Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate (৳/L)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Opening Reading
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Closing Reading
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Litres Sold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount (৳)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pumps.map((pump) => {
                  const litres = pump.closingReading ? pump.closingReading - pump.openingReading : 0;
                  const amount = litres * FUEL_PRICES[pump.fuelType];
                  const isComplete = pump.closingReading !== null;
                  
                  return (
                    <tr key={pump.id} className={isComplete ? 'bg-green-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                            pump.fuelType === 'Petrol' ? 'bg-amber-100 text-amber-700' :
                            pump.fuelType === 'Diesel' ? 'bg-blue-100 text-blue-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {pump.id}
                          </div>
                          <span className="ml-3 font-medium text-gray-900">{pump.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          pump.fuelType === 'Petrol' ? 'bg-amber-100 text-amber-800' :
                          pump.fuelType === 'Diesel' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {pump.fuelType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ৳{FUEL_PRICES[pump.fuelType].toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {pump.openingReading.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.01"
                          min={pump.openingReading}
                          value={pump.closingReading || ''}
                          onChange={(e) => handleReadingChange(pump.id, e.target.value)}
                          disabled={dayStatus === 'closed'}
                          className={`w-32 px-3 py-2 text-sm font-mono border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                            dayStatus === 'closed' ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                          }`}
                          placeholder="Enter..."
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {litres > 0 ? litres.toFixed(2) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {amount > 0 ? formatCurrency(amount) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isComplete ? (
                          <span className="inline-flex items-center text-green-600">
                            <CheckCircleIcon className="h-5 w-5 mr-1" />
                            Done
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-yellow-600">
                            <ExclamationTriangleIcon className="h-5 w-5 mr-1" />
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-right font-semibold text-gray-700">
                    Total:
                  </td>
                  <td className="px-6 py-4 text-sm font-bold font-mono text-gray-900">
                    {totals.litres.toFixed(2)} L
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-indigo-600">
                    {formatCurrency(totals.amount)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <button
            onClick={() => location.reload()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Refresh Data
          </button>
          
          <div className="flex items-center gap-3">
            <button
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Save Draft
            </button>
            <button
              onClick={handleCloseDay}
              disabled={dayStatus === 'closed'}
              className={`inline-flex items-center px-6 py-2 rounded-md text-sm font-semibold shadow-sm ${
                dayStatus === 'closed'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              {dayStatus === 'closed' ? 'Day Closed' : 'Close Day'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
