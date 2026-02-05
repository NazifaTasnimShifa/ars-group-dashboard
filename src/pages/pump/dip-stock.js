// src/pages/pump/dip-stock.js
// ARS Corporation - Underground Tank Dip Stock Tracking

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppContext } from '@/contexts/AppContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  CalendarDaysIcon,
  BeakerIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

function DipStockPage() {
  const { formatCurrency, authFetch, currentBusiness } = useAppContext();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [tanks, setTanks] = useState([]);
  const [readings, setReadings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Fetch tank data and readings
  const fetchData = async () => {
    if (!currentBusiness?.id) return;

    try {
      setLoading(true);
      const res = await authFetch(`/api/pump/dip-readings?company_id=${currentBusiness.id}&date=${selectedDate}`);
      const result = await res.json();

      if (result.success && result.data) {
        setTanks(result.data.tanks || []);
        
        // Build readings state from fetched data
        const readingsState = {};
        result.data.tanks.forEach(tank => {
          readingsState[tank.id] = {
            openingDip: tank.openingDip,
            closingDip: tank.closingDip,
            liftingToday: tank.liftingToday || 0
          };
        });
        setReadings(readingsState);
      }
    } catch (err) {
      console.error("Failed to fetch dip readings", err);
      setMessage({ type: 'error', text: 'Failed to load dip readings' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts or date changes
  useEffect(() => {
    fetchData();
  }, [currentBusiness?.id, selectedDate]);

  // Calculate tank status
  const getTankStatus = (tankId) => {
    const tank = tanks.find(t => t.id === tankId);
    if (!tank) return { status: 'normal', label: 'Normal' };
    
    const reading = readings[tankId];
    if (!reading) return { status: 'normal', label: 'Normal' };
    
    const currentLevel = reading.closingDip || reading.openingDip || 0;
    const percentage = (currentLevel / tank.capacity) * 100;

    if (percentage < 20) return { status: 'critical', label: 'Critical' };
    if (percentage < 40) return { status: 'low', label: 'Low' };
    if (percentage > 80) return { status: 'full', label: 'Full' };
    return { status: 'normal', label: 'Normal' };
  };

  // Handle dip reading update
  const handleDipChange = (tankId, field, value) => {
    setReadings(prev => ({
      ...prev,
      [tankId]: {
        ...prev[tankId],
        [field]: value ? parseFloat(value) : null
      }
    }));
  };

  // Save dip readings
  const handleSave = async () => {
    if (!currentBusiness?.id) return;

    try {
      setSaving(true);
      setMessage(null);

      // Prepare readings array for API
      const readingsToSave = [];
      
      Object.entries(readings).forEach(([tankId, reading]) => {
        // Save opening reading if it exists
        if (reading.openingDip !== null && reading.openingDip !== undefined) {
          readingsToSave.push({
            tankId,
            readingType: 'OPENING',
            dipMm: 0, // You may want to add actual dip mm measurement
            calculatedStock: reading.openingDip,
            temperature: null,
            notes: null
          });
        }

        // Save closing reading if it exists
        if (reading.closingDip !== null && reading.closingDip !== undefined) {
          readingsToSave.push({
            tankId,
            readingType: 'CLOSING',
            dipMm: 0,
            calculatedStock: reading.closingDip,
            temperature: null,
            notes: null
          });
        }

        // Save lifting (fuel received) reading if it exists
        if (reading.liftingToday !== null && reading.liftingToday !== undefined && reading.liftingToday > 0) {
          readingsToSave.push({
            tankId,
            readingType: 'RECEIPT',
            dipMm: 0,
            calculatedStock: reading.liftingToday,
            temperature: null,
            notes: 'Fuel received/lifting'
          });
        }
      });

      const res = await authFetch(`/api/pump/dip-readings?company_id=${currentBusiness.id}`, {
        method: 'POST',
        body: JSON.stringify({ readings: readingsToSave })
      });

      const result = await res.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Dip readings saved successfully!' });
        // Refresh data to get latest values
        setTimeout(() => {
          fetchData();
          setMessage(null);
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to save readings' });
      }
    } catch (err) {
      console.error("Failed to save dip readings", err);
      setMessage({ type: 'error', text: 'Failed to save dip readings' });
    } finally {
      setSaving(false);
    }
  };

  // Calculate totals
  const totals = tanks.reduce((acc, tank) => {
    const reading = readings[tank.id] || {};
    acc.opening += reading.openingDip || 0;
    acc.closing += reading.closingDip || reading.openingDip || 0;
    acc.lifting += reading.liftingToday || 0;
    return acc;
  }, { opening: 0, closing: 0, lifting: 0 });

  const getFuelTypeColor = (fuelType) => {
    const type = fuelType?.toLowerCase() || '';
    if (type.includes('petrol') || type.includes('octane')) return 'amber';
    if (type.includes('diesel')) return 'blue';
    return 'purple';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading dip stock data...</div>
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
            <h1 className="text-2xl font-bold text-gray-900">Dip Stock - Underground Tanks</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track fuel levels in underground storage tanks
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

        {/* Success/Error Message */}
        {message && (
          <div className={`rounded-md p-4 ${message.type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex">
              {message.type === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              )}
              <p className={`ml-3 text-sm font-medium ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                {message.text}
              </p>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl p-5 text-white">
            <p className="text-slate-300 text-sm">Opening Stock</p>
            <p className="text-2xl font-bold mt-1">{(totals.opening / 1000).toFixed(1)}K L</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
            <p className="text-green-100 text-sm">Fuel Received</p>
            <p className="text-2xl font-bold mt-1">{(totals.lifting / 1000).toFixed(1)}K L</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white">
            <p className="text-amber-100 text-sm">Expected Closing</p>
            <p className="text-2xl font-bold mt-1">{((totals.opening + totals.lifting) / 1000).toFixed(1)}K L</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
            <p className="text-blue-100 text-sm">Total Capacity</p>
            <p className="text-2xl font-bold mt-1">{(tanks.reduce((s, t) => s + t.capacity, 0) / 1000).toFixed(0)}K L</p>
          </div>
        </div>

        {/* Tank Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tanks.map((tank) => {
            const reading = readings[tank.id] || {};
            const currentLevel = reading.closingDip || reading.openingDip || 0;
            const percentage = (currentLevel / tank.capacity) * 100;
            const { status, label } = getTankStatus(tank.id);

            const color = getFuelTypeColor(tank.fuelType);
            const colorMap = {
              amber: { bg: 'bg-amber-500', light: 'bg-amber-100', text: 'text-amber-700' },
              blue: { bg: 'bg-blue-500', light: 'bg-blue-100', text: 'text-blue-700' },
              purple: { bg: 'bg-purple-500', light: 'bg-purple-100', text: 'text-purple-700' },
            };
            const colors = colorMap[color];

            return (
              <div key={tank.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${colors.light}`}>
                      <BeakerIcon className={`h-6 w-6 ${colors.text}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Tank {tank.tankNumber}</h3>
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${colors.light} ${colors.text}`}>
                        {tank.fuelType}
                      </span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${status === 'critical' ? 'bg-red-100 text-red-700' :
                    status === 'low' ? 'bg-yellow-100 text-yellow-700' :
                      status === 'full' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                    }`}>
                    {status === 'critical' && <ExclamationTriangleIcon className="h-3 w-3 mr-1" />}
                    {label}
                  </span>
                </div>

                {/* Tank Level Visualization */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{currentLevel.toLocaleString()} L</span>
                    <span>{percentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors.bg} transition-all duration-300`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0 L</span>
                    <span>{tank.capacity.toLocaleString()} L</span>
                  </div>
                </div>

                {/* Dip Readings */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Opening Dip</label>
                    <input
                      type="number"
                      value={reading.openingDip || ''}
                      onChange={(e) => handleDipChange(tank.id, 'openingDip', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border rounded-md bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Lifting Today</label>
                    <input
                      type="number"
                      value={reading.liftingToday || ''}
                      onChange={(e) => handleDipChange(tank.id, 'liftingToday', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border rounded-md bg-green-50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Closing Dip</label>
                    <input
                      type="number"
                      value={reading.closingDip || ''}
                      onChange={(e) => handleDipChange(tank.id, 'closingDip', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border rounded-md bg-amber-50"
                      placeholder="Enter..."
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Dip Readings'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );

}

export default DipStockPage;
