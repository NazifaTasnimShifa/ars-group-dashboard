// src/components/dashboard/DebtorsTable.js
// Fetches data from API with authentication

import { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import FilterButtons from '@/components/ui/FilterButtons';

export default function DebtorsTable() {
    const { currentBusiness, isSuperOwner, isViewingAllBusinesses, formatCurrency, authFetch } = useAppContext();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDebtors = async () => {
            if (!authFetch) return; // Wait for auth context

            setLoading(true);
            try {
                let url = '/api/debtors';
                if (currentBusiness?.id) {
                    url += `?company_id=${currentBusiness.id}`;                } else if (isSuperOwner) {
                    url += '?viewAll=true';
                }

                const res = await authFetch(url);
                const json = await res.json();
                if (json.success && Array.isArray(json.data)) {
                    setData(json.data);
                } else if (Array.isArray(json)) {
                    setData(json);
                } else {
                    setData([]);
                }
            } catch (error) {
                console.error('Failed to fetch debtors:', error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDebtors();
    }, [currentBusiness, isSuperOwner, isViewingAllBusinesses, authFetch]);

    const getAgingColor = (aging) => {
        if (!aging || aging <= 7) return 'text-green-600';
        if (aging <= 30) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="rounded-lg bg-white p-4 shadow">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Sundry Debtors</h3>
                <FilterButtons periods={['7D', '1M', '3M']} />
            </div>
            <div className="flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        {loading ? (
                            <div className="py-4 text-center text-sm text-gray-500">Loading...</div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead>
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Debtor Name</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Aging</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {data.length > 0 ? (
                                        data.map((person, idx) => (
                                            <tr key={person.id || idx}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{person.name}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatCurrency(person.amount)}</td>
                                                <td className={`whitespace-nowrap px-3 py-4 text-sm font-medium ${getAgingColor(person.aging)}`}>{person.aging || 0} days</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="py-4 text-center text-sm text-gray-500">No debtor data available</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}