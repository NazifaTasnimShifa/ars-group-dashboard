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
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

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
      fetchData(range);
    };

    useEffect(() => {
        if (currentBusiness?.id && dateRange.startDate && dateRange.endDate) {
            fetchData(dateRange);
        }
    }, [currentBusiness, dateRange, fetchData]);

  if (loading) {
     return <DashboardLayout><div className="p-8 text-center">Loading report data...</div></DashboardLayout>;
  }

  if (error) {
     return (
        <DashboardLayout>
            <div className="p-8 text-center text-red-600">
                {error}
                <button onClick={() => fetchData(dateRange)} className="ml-4 underline">Retry</button>
            </div>
        </DashboardLayout>
    );
  }

  if (!data) {
      return (
        <DashboardLayout>
            <div className="p-8 text-center text-gray-500">
                Initializing report...
                {!currentBusiness ? ' (Waiting for Business Context)' : ''}
                {!dateRange.startDate ? ' (Waiting for Dates)' : ''}
                <br/>
                <button onClick={() => fetchData(dateRange)} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded">
                    Load Report
                </button>
            </div>
        </DashboardLayout>
      );
  }

  const totalDebits = data.accounts.reduce((sum, acc) => sum + acc.debit, 0);
  const totalCredits = data.accounts.reduce((sum, acc) => sum + acc.credit, 0);

  return (
    <DashboardLayout>
      <PageHeader title="Trial Balance" description={`Verifies that total debits equal total credits for ${currentBusiness.name} as at ${data.date}.`} />
      <div className="max-w-4xl mx-auto">
          <div className="mb-4 flex justify-end">
             <DateRangeFilter onFilterChange={handleFilterChange} />
          </div>
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
    </div>
    </DashboardLayout>
  );
}
