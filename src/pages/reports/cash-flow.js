// src/pages/reports/cash-flow.js

import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from '@/components/ui/PageHeader';
import DateRangeFilter from '@/components/ui/DateRangeFilter';

const formatCurrency = (val) => `৳${(val || 0).toLocaleString('en-IN')}`;

const CashFlowRow = ({ name, amount, isTotal = false, isSubtotal = false, indent = false }) => {
  const isNegative = amount < 0;
  const amountDisplay = isNegative ? `(${formatCurrency(Math.abs(amount))})` : formatCurrency(amount);
  const amountColor = isNegative ? 'text-red-600' : 'text-gray-800';

  return (
    <div className={`flex justify-between py-2 ${!isTotal && 'border-b border-gray-200'} ${indent && 'pl-6'}`}>
      <p className={`text-sm ${isTotal || isSubtotal ? 'font-semibold' : 'text-gray-600'}`}>{name}</p>
      <p className={`text-sm ${amountColor} ${isTotal || isSubtotal ? 'font-semibold' : ''}`}>{amountDisplay}</p>
    </div>
  );
};

const CashFlowSection = ({ title, items = [] }) => {
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  return (
    <div className="mt-4">
      <h4 className="text-md font-semibold text-gray-800">{title}</h4>
      <div className="mt-2">
        {items.map(item => <CashFlowRow key={item.name} name={item.name} amount={item.amount} indent />)}
        <CashFlowRow name={`Net Cash Flow from ${title}`} amount={total} isSubtotal />
      </div>
    </div>
  );
};

export default function CashFlowPage() {
  const { currentBusiness, authFetch } = useAppContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  });

  const fetchData = useCallback(async (range) => {
    if (!currentBusiness?.id || !authFetch) return;

    const start = range?.startDate || dateRange.startDate;
    const end = range?.endDate || dateRange.endDate;

    if (!start || !end) return;

    try {
      setLoading(true);
      const res = await authFetch(`/api/reports?type=cash-flow&companyId=${currentBusiness.id}&startDate=${start}&endDate=${end}`);
      const json = await res.json();

      if (res.ok) {
        setData(json.data);
      } else {
        setError(json.error || 'Failed to fetch report');
        setData(null);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load report data');
    } finally {
      setLoading(false);
    }
  }, [currentBusiness, authFetch, dateRange]);

  const handleFilterChange = (range) => {
    setDateRange(range);
    // Only fetch if we have currentBusiness, otherwise useEffect will handle it
    if (currentBusiness?.id) {
      fetchData(range);
    }
  };

  // Auto-fetch when currentBusiness becomes available and we have valid dates
  useEffect(() => {
    if (currentBusiness?.id && dateRange.startDate && dateRange.endDate && !data && !loading) {
      fetchData(dateRange);
    }
  }, [currentBusiness?.id, dateRange.startDate, dateRange.endDate]);

  // Compute values only if data exists
  const totalOperating = data?.operating?.reduce((sum, item) => sum + item.amount, 0) || 0;
  const totalInvesting = data?.investing?.reduce((sum, item) => sum + item.amount, 0) || 0;
  const totalFinancing = data?.financing?.reduce((sum, item) => sum + item.amount, 0) || 0;
  const netChangeInCash = totalOperating + totalInvesting + totalFinancing;
  const closingCash = (data?.openingCash || 0) + netChangeInCash;

  // Render content based on state
  const renderContent = () => {
    if (loading) {
      return (
        <div className="p-8 text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          Loading report data...
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => fetchData(dateRange)} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
            Retry
          </button>
        </div>
      );
    }

    if (!data || !data.operating) {
      return (
        <div className="p-8 text-center text-gray-500">
          <p className="mb-4">Select a date range and click Load Report to view the Cash Flow Statement.</p>
          <button onClick={() => fetchData(dateRange)} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
            Load Report
          </button>
        </div>
      );
    }

    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">{currentBusiness?.name || 'Company'}</h2>
          <p className="text-sm text-gray-500">Cash Flow Statement</p>
          <p className="text-sm text-gray-500">
            {dateRange.startDate && dateRange.endDate ?
              `${new Date(dateRange.startDate).toLocaleDateString()} - ${new Date(dateRange.endDate).toLocaleDateString()}`
              : data.date}
          </p>
        </div>

        <div className="space-y-6">
          <CashFlowSection title="Operating Activities" items={data.operating} />
          <CashFlowSection title="Investing Activities" items={data.investing} />
          <CashFlowSection title="Financing Activities" items={data.financing} />

          <div className="mt-6 pt-4 border-t-2 border-gray-400">
            <CashFlowRow name="Net Increase/(Decrease) in Cash" amount={netChangeInCash} isSubtotal />
            <CashFlowRow name="Opening Cash & Equivalents" amount={data.openingCash} />
          </div>

          <div className="mt-4 pt-4 border-t-2 border-gray-800">
            <CashFlowRow name="Closing Cash & Equivalents" amount={closingCash} isTotal />
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Cash Flow Statement"
        description={`A summary of cash inflows and outflows for ${currentBusiness?.name || 'your company'}.`}
      />

      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-end">
          <DateRangeFilter onFilterChange={handleFilterChange} initialRange={dateRange} />
        </div>
        {renderContent()}
      </div>
    </DashboardLayout>
  );
}
