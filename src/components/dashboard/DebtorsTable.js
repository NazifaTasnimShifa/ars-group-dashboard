// src/components/dashboard/DebtorsTable.js

import { sundryDebtors } from '@/data/mockData';
import { useAppContext } from '@/contexts/AppContext';
import FilterButtons from '@/components/ui/FilterButtons'; // CORRECTED PATH using '@'

export default function DebtorsTable() {
    const { selectedCompany } = useAppContext();
    const data = sundryDebtors[selectedCompany.id] || [];

    return (
        <div className="rounded-lg bg-white p-4 shadow">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Sundry Debtors</h3>
                <FilterButtons periods={['7D', '1M', '3M']} />
            </div>
            <div className="flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Debtor Name</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Aging</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {data.map((person) => (
                                    <tr key={person.id}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{person.name}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">৳{person.amount.toLocaleString('en-IN')}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.aging} days</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}