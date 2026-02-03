// src/pages/lube/dealers.js
// ARS Lube - Dealers (Sundry Debtors) Page

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAppContext } from '@/contexts/AppContext';
import { sundryDebtors } from '@/data/mockData';
import { PlusCircleIcon, PhoneIcon } from '@heroicons/react/24/outline';
import Modal from '@/components/ui/Modal';
import DebtorForm from '@/components/forms/DebtorForm';

export default function LubeDealersPage() {
    const { currentBusiness, formatCurrency, formatDate, authFetch } = useAppContext();
    const [dealers, setDealers] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const businessKey = currentBusiness?.code === 'ARS-LUBE' ? 'ars_lube' : 'ars_lube';
        setDealers(sundryDebtors[businessKey] || sundryDebtors.ars_lube);
    }, [currentBusiness]);

    const handleSave = async (data) => {
        try {
            const res = await authFetch('/api/debtors', {
                method: 'POST',
                body: JSON.stringify({ ...data, company_id: currentBusiness?.id })
            });
            const result = await res.json();
            if (result.success) {
                alert('Dealer added successfully!');
                setModalOpen(false);
            } else {
                alert(result.message || 'Failed to save');
            }
        } catch (err) {
            console.error('Save error:', err);
            alert('Failed to save. Please try again.');
        }
    };

    useEffect(() => {
        const businessKey = currentBusiness?.code === 'ARS-LUBE' ? 'ars_lube' : 'ars_lube';
        setDealers(sundryDebtors[businessKey] || sundryDebtors.ars_lube);
    }, [currentBusiness]);

    const getAgingColor = (aging) => {
        if (aging <= 7) return 'text-green-600';
        if (aging <= 30) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dealers / Debtors</h1>
                        <p className="mt-1 text-sm text-gray-500">Track customer outstanding balances</p>
                    </div>
                    <button
                        onClick={() => setModalOpen(true)}
                        className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    >
                        <PlusCircleIcon className="h-5 w-5" />
                        Add Dealer
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {dealers.map((dealer) => (
                        <div key={dealer.id} className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-900 truncate">{dealer.name}</h3>
                                    <span className={`text-sm font-medium ${getAgingColor(dealer.aging)}`}>
                                        {dealer.aging} days
                                    </span>
                                </div>
                                <div className="mt-4">
                                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(dealer.amount)}</p>
                                    <p className="text-sm text-gray-500">Due: {dealer.due}</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-5 py-3 flex justify-between">
                                <button onClick={() => alert('View Details feature is under development.')} className="text-sm text-indigo-600 hover:text-indigo-800">View Details</button>
                                <button onClick={() => alert('Record Payment feature is under development.')} className="text-sm text-green-600 hover:text-green-800">Record Payment</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal for Dealer Form */}
            <Modal open={modalOpen} setOpen={setModalOpen} title="Add Dealer">
                <DebtorForm onSave={handleSave} onCancel={() => setModalOpen(false)} />
            </Modal>
        </DashboardLayout>
    );
}
