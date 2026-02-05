// src/pages/pump/daily-operations.js
// ARS Corporation - Daily Pump Operations Page

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAppContext } from '@/contexts/AppContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function DailyOperationsPage() {
  const { formatCurrency, currentBusiness, authFetch } = useAppContext();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dayStatus, setDayStatus] = useState('OPEN');
  const [pumps, setPumps] = useState([]);
  const [shiftId, setShiftId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creditSales, setCreditSales] = useState(0);

  // Fetch data from API
  const fetchData = useCallback(async () => {
    if (!currentBusiness?.id) return;

    setLoading(true);
    try {
      const res = await authFetch(`/api/pump/daily-operations?company_id=${currentBusiness.id}&date=${selectedDate}`);
      const result = await res.json();

      if (result.success) {
        setPumps(result.data.pumps || []);
        setShiftId(result.data.shiftId);
        setDayStatus(result.data.status || 'OPEN');
        setCreditSales(result.data.creditSalesTotal || 0);
      } else {
        console.error('Failed to fetch data:', result.message);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [authFetch, currentBusiness?.id, selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate totals
  const totals = pumps.reduce((acc, pump) => {
    if (pump.closingReading && pump.openingReading) {
      const litres = pump.closingReading - pump.openingReading;
      const amount = litres * pump.pricePerLiter;
      acc.litres += litres;
      acc.amount += amount;
    }
    return acc;
  }, { litres: 0, amount: 0 });

  // Handle meter reading change and save
  const handleReadingChange = async (pumpId, value) => {
    const newValue = value ? parseFloat(value) : null;

    // Update local state immediately
    setPumps(prev => prev.map(p =>
      p.id === pumpId
        ? { ...p, closingReading: newValue }
        : p
    ));
  };

  // Save readings (debounced call on blur)
  const saveReading = async (pumpId) => {
    const pump = pumps.find(p => p.id === pumpId);
    if (!pump || pump.closingReading === null) return;

    setSaving(true);
    try {
      const res = await authFetch(`/api/pump/daily-operations?company_id=${currentBusiness.id}&date=${selectedDate}`, {
        method: 'POST',
        body: JSON.stringify({
          shiftId,
          readings: [{
            nozzleId: pump.id,
            closingReading: pump.closingReading
          }]
        })
      });
      const result = await res.json();
      if (result.success && result.shiftId) {
        setShiftId(result.shiftId);
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save reading. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Close day
  const handleCloseDay = async () => {
    const unclosed = pumps.filter(p => !p.closingReading);
    if (unclosed.length > 0) {
      alert(`Please enter closing readings for: ${unclosed.map(p => p.pumpName).join(', ')}`);
      return;
    }

    if (!shiftId) {
      alert('No shift found. Please save readings first.');
      return;
    }

    try {
      const res = await authFetch(`/api/pump/daily-operations?company_id=${currentBusiness.id}`, {
        method: 'PUT',
        body: JSON.stringify({ shiftId })
      });
      const result = await res.json();

      if (result.success) {
        setDayStatus('CLOSED');
        alert('Day closed successfully! All readings recorded.');
      } else {
        alert(result.message || 'Failed to close day');
      }
    } catch (err) {
      console.error('Close day error:', err);
      alert('Failed to close day. Please try again.');
    }
  };

  if (loading) {
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
            <div className={`flex items-center px-3 py-2 rounded-lg ${dayStatus === 'OPEN'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
              }`}>
              {dayStatus === 'OPEN' ? (
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

            {saving && <span className="text-sm text-gray-500">Saving...</span>}
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
            <p className="text-2xl font-bold mt-1">{formatCurrency(totals.amount - creditSales)}</p>
            <p className="text-purple-200 text-xs">Total - {formatCurrency(creditSales)} Credit</p>
          </div>
        </div>

        {/* Pump Readings Table */}
        {pumps.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No Pumps Found</h3>
            <p className="text-gray-500 mt-2">Please configure pumps and nozzles for this business first.</p>
            <Link 
              href="/pump/config" 
              className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Go to Configuration
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Pump Meter Readings</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pump/Nozzle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuel Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate (৳/L)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opening Reading</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Closing Reading</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Litres Sold</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (৳)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pumps.map((pump) => {
                    const litres = pump.closingReading ? pump.closingReading - pump.openingReading : 0;
                    const amount = litres * pump.pricePerLiter;
                    const isComplete = pump.closingReading !== null;

                    return (
                      <tr key={pump.id} className={isComplete ? 'bg-green-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-900">{pump.pumpName}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${pump.fuelType === 'Petrol' ? 'bg-amber-100 text-amber-800' :
                              pump.fuelType === 'Diesel' ? 'bg-blue-100 text-blue-800' :
                                'bg-purple-100 text-purple-800'
                            }`}>
                            {pump.fuelType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ৳{pump.pricePerLiter?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {pump.openingReading?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            step="0.01"
                            min={pump.openingReading || 0}
                            value={pump.closingReading || ''}
                            onChange={(e) => handleReadingChange(pump.id, e.target.value)}
                            onBlur={() => saveReading(pump.id)}
                            disabled={dayStatus === 'CLOSED'}
                            className={`w-32 px-3 py-2 text-sm font-mono border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${dayStatus === 'CLOSED' ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
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
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <button
            onClick={fetchData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Refresh Data
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCloseDay}
              disabled={dayStatus === 'CLOSED' || pumps.length === 0}
              className={`inline-flex items-center px-6 py-2 rounded-md text-sm font-semibold shadow-sm ${dayStatus === 'CLOSED' || pumps.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
                }`}
            >
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              {dayStatus === 'CLOSED' ? 'Day Closed' : 'Close Day'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

