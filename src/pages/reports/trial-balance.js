// src/pages/reports/trial-balance.js

import { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from '@/components/ui/PageHeader';

const formatCurrency = (val) => val === 0 ? '-' : `৳${(val || 0).toLocaleString('en-IN')}`;

export default function TrialBalancePage() {
  const { currentBusiness, authFetch } = useAppContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentBusiness) {
      setLoading(true);
      authFetch(`/api/reports?type=trial-balance&companyId=${currentBusiness.id}`)
        .then(res => res.json())
        .then(result => {
          setData(result.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [currentBusiness, authFetch]);

  if (loading || !data || !data.accounts) { 
    return <DashboardLayout><div>Loading...</div></DashboardLayout>; 
  }

  const totalDebits = data.accounts.reduce((sum, acc) => sum + acc.debit, 0);
  const totalCredits = data.accounts.reduce((sum, acc) => sum + acc.credit, 0);

  return (
    <DashboardLayout>
      <PageHeader title="Trial Balance" description={`Verifies that total debits equal total credits for ${currentBusiness.name} as at ${data.date}.`} />
      <div className="max-w-4xl mx-auto rounded-lg bg-white p-6 shadow">
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
    </DashboardLayout>
  );
}
