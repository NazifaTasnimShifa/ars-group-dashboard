// src/pages/reports/balance-sheet.js

import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { balanceSheetData } from '@/data/mockData';
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from '@/components/ui/PageHeader';
import DateRangeFilter from '@/components/ui/DateRangeFilter';

const ReportRow = ({ name, amount, isTotal = false, isSubtotal = false, indent = false }) => {
  const formatCurrency = (val) => `৳${(val || 0).toLocaleString('en-IN')}`; return (
    <div className={`flex justify-between py-2 ${!isTotal && 'border-b'} ${indent && 'pl-6'}`}>
      <p className={`text-sm ${isTotal || isSubtotal ? 'font-bold' : 'text-gray-600'}`}>
        {name}
      </p>
      <p className={`text-sm ${isTotal || isSubtotal ? 'font-bold' : 'text-gray-800'}`}>
        {formatCurrency(amount)}
      </p>
    </div>
  );
};

const ReportSection = ({ title, items }) => {
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  return (
    <div className="mt-4">
      <h4 className="text-md font-semibold text-gray-800">{title}</h4>
      <div className="mt-2">
        {items.map(item => <ReportRow key={item.name} name={item.name} amount={item.amount} indent />)}
        <ReportRow name={`Total ${title}`} amount={total} isSubtotal />
      </div>
    </div>
  );
};

export default function BalanceSheetPage() {
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
      const res = await authFetch(`/api/reports?type=balance-sheet&companyId=${currentBusiness.id}&startDate=${start}&endDate=${end}`);
      const json = await res.json();

      if (res.ok) {
        setData(json);
      } else {
        setError(json.error || 'Failed to fetch report');
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

  // Compute totals only if data exists
  const totalNonCurrentAssets = data?.assets?.nonCurrent?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
  const totalCurrentAssets = data?.assets?.current?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
  const totalAssets = totalNonCurrentAssets + totalCurrentAssets;

  const totalNonCurrentLiabilities = data?.liabilities?.nonCurrent?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
  const totalCurrentLiabilities = data?.liabilities?.current?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
  const totalLiabilities = totalNonCurrentLiabilities + totalCurrentLiabilities;

  const totalEquity = data?.equity?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

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

    if (!data) {
      return (
        <div className="p-8 text-center text-gray-500">
          <p className="mb-4">Select a date range and click Load Report to view the Balance Sheet.</p>
          <button onClick={() => fetchData(dateRange)} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
            Load Report
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ASSETS Column */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-2">ASSETS</h3>
          <ReportSection title="Non-Current Assets" items={data.assets?.nonCurrent || []} />
          <ReportSection title="Current Assets" items={data.assets?.current || []} />
          <div className="mt-4 pt-4 border-t-2 border-gray-800">
            <ReportRow name="TOTAL ASSETS" amount={totalAssets} isTotal />
          </div>
        </div>

        {/* LIABILITIES & EQUITY Column */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-2">LIABILITIES & EQUITY</h3>
          <ReportSection title="Non-Current Liabilities" items={data.liabilities?.nonCurrent || []} />
          <ReportSection title="Current Liabilities" items={data.liabilities?.current || []} />
          <ReportSection title="Shareholders' Equity" items={data.equity || []} />
          <div className="mt-4 pt-4 border-t-2 border-gray-800">
            <ReportRow name="TOTAL LIABILITIES & EQUITY" amount={totalLiabilitiesAndEquity} isTotal />
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Balance Sheet"
        description={`A statement of the financial position of ${currentBusiness?.name || 'your company'}.`}
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
