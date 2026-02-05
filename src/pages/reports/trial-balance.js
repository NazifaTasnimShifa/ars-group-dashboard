// src/pages/reports/trial-balance.js

import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from '@/components/ui/PageHeader';
import DateRangeFilter from '@/components/ui/DateRangeFilter';

const formatCurrency = (val) => val === 0 ? '-' : `৳${(val || 0).toLocaleString('en-IN')}`;

export default function TrialBalancePage() {
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
      const res = await authFetch(`/api/reports?type=trial-balance&companyId=${currentBusiness.id}&startDate=${start}&endDate=${end}`);
      const json = await res.json();

      if (res.ok) {
        setData(json);
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
  const totalDebits = data?.accounts?.reduce((sum, acc) => sum + acc.debit, 0) || 0;
  const totalCredits = data?.accounts?.reduce((sum, acc) => sum + acc.credit, 0) || 0;

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

    if (!data || !data.accounts) {
      return (
        <div className="p-8 text-center text-gray-500">
          <p className="mb-4">Select a date range and click Load Report to view the Trial Balance.</p>
          <button onClick={() => fetchData(dateRange)} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
            Load Report
          </button>
        </div>
      );
    }

    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <table className="min-w-full">
          <thead className="border-b-2 border-gray-800">
            <tr>
              <th className="py-3.5 text-left text-sm font-semibold text-gray-900">Account Title</th>
              <th className="py-3.5 text-right text-sm font-semibold text-gray-900">Debit</th>
              <th className="py-3.5 text-right text-sm font-semibold text-gray-900">Credit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.accounts.map((acc, idx) => (
              <tr key={`${acc.name}-${idx}`}>
                <td className="whitespace-nowrap py-4 text-sm font-medium text-gray-800">{acc.name}</td>
                <td className="whitespace-nowrap py-4 text-sm text-gray-500 text-right">{formatCurrency(acc.debit)}</td>
                <td className="whitespace-nowrap py-4 text-sm text-gray-500 text-right">{formatCurrency(acc.credit)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-gray-800">
            <tr>
              <th className="py-4 text-left text-sm font-bold text-gray-900">Totals</th>
              <th className="py-4 text-right text-sm font-bold text-gray-900">{formatCurrency(totalDebits)}</th>
              <th className="py-4 text-right text-sm font-bold text-gray-900">{formatCurrency(totalCredits)}</th>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Trial Balance"
        description={`Verifies that total debits equal total credits for ${currentBusiness?.name || 'your company'}.`}
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
