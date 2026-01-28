// src/pages/pump/dip-stock.js
// ARS Corporation - Underground Tank Dip Stock Tracking

import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  CalendarDaysIcon, 
  BeakerIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Tank configuration
const TANKS = [
  { id: 'T1', name: 'Tank 1', fuelType: 'Petrol', capacity: 25000, color: 'amber' },
  { id: 'T2', name: 'Tank 2', fuelType: 'Diesel', capacity: 30000, color: 'blue' },
  { id: 'T3', name: 'Tank 3', fuelType: 'Diesel', capacity: 25000, color: 'blue' },
  { id: 'T4', name: 'Tank 4', fuelType: 'Octane', capacity: 15000, color: 'purple' },
];

// Initial dip readings
const INITIAL_READINGS = {
  'T1': { openingDip: 18500, closingDip: null, liftingToday: 5000 },
  'T2': { openingDip: 22000, closingDip: null, liftingToday: 8000 },
  'T3': { openingDip: 15000, closingDip: null, liftingToday: 0 },
  'T4': { openingDip: 8500, closingDip: null, liftingToday: 0 },
};

export default function DipStockPage() {
  const { formatCurrency } = useAppContext();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [readings, setReadings] = useState(INITIAL_READINGS);

  // Calculate tank status
  const getTankStatus = (tankId) => {
    const tank = TANKS.find(t => t.id === tankId);
    const reading = readings[tankId];
    const currentLevel = reading.closingDip || reading.openingDip;
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

  // Calculate totals
  const totals = TANKS.reduce((acc, tank) => {
    const reading = readings[tank.id];
    acc.opening += reading.openingDip || 0;
    acc.closing += reading.closingDip || reading.openingDip || 0;
    acc.lifting += reading.liftingToday || 0;
    return acc;
  }, { opening: 0, closing: 0, lifting: 0 });

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
            <p className="text-2xl font-bold mt-1">{(TANKS.reduce((s, t) => s + t.capacity, 0) / 1000).toFixed(0)}K L</p>
          </div>
        </div>

        {/* Tank Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TANKS.map((tank) => {
            const reading = readings[tank.id];
            const currentLevel = reading.closingDip || reading.openingDip;
            const percentage = (currentLevel / tank.capacity) * 100;
            const { status, label } = getTankStatus(tank.id);
            
            const colorMap = {
              amber: { bg: 'bg-amber-500', light: 'bg-amber-100', text: 'text-amber-700' },
              blue: { bg: 'bg-blue-500', light: 'bg-blue-100', text: 'text-blue-700' },
              purple: { bg: 'bg-purple-500', light: 'bg-purple-100', text: 'text-purple-700' },
            };
            const colors = colorMap[tank.color];
            
            return (
              <div key={tank.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${colors.light}`}>
                      <BeakerIcon className={`h-6 w-6 ${colors.text}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{tank.name}</h3>
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${colors.light} ${colors.text}`}>
                        {tank.fuelType}
                      </span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                    status === 'critical' ? 'bg-red-100 text-red-700' :
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
                      style={{ width: `${percentage}%` }}
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
            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 shadow-sm"
          >
            Save Dip Readings
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
