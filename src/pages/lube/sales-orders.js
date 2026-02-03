// src/pages/lube/sales-orders.js
// ARS Lube - Sales Orders Page

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAppContext } from '@/contexts/AppContext';
import { salesData } from '@/data/mockData';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import Modal from '@/components/ui/Modal';
import SaleForm from '@/components/forms/SaleForm';

export default function LubeSalesOrdersPage() {
    const { currentBusiness, formatCurrency, formatDate, isSuperOwner, authFetch } = useAppContext();
    const [sales, setSales] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        // Use mock data for now, keyed by business
        const businessKey = currentBusiness?.code === 'ARS-LUBE' ? 'ars_lube' : 'ars_lube';
        setSales(salesData[businessKey] || salesData.ars_lube);
    }, [currentBusiness]);

    const handleSave = async (data) => {
        try {
            const res = await authFetch('/api/sales', {
                method: 'POST',
                body: JSON.stringify({
                    ...data,
                    company_id: currentBusiness?.id
                })
            });
            const result = await res.json();
            if (result.success) {
                alert('Sale recorded successfully!');
                setModalOpen(false);
                // TODO: Refresh data
            } else {
                alert(result.message || 'Failed to save');
            }
        } catch (err) {
            console.error('Save error:', err);
            alert('Failed to save. Please try again.');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            Paid: 'bg-green-100 text-green-800',
            Unpaid: 'bg-red-100 text-red-800',
            Partial: 'bg-yellow-100 text-yellow-800',
        };
        return (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Sales Orders</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage lubricant and fuel sales invoices</p>
                    </div>
                    <button
                        onClick={() => setModalOpen(true)}
                        className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    >
                        <PlusCircleIcon className="h-5 w-5" />
                        New Sale
                    </button>
                </div>

                <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sales.map((sale) => (
                                <tr key={sale.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">{sale.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.customer}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{formatCurrency(sale.amount)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">{getStatusBadge(sale.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Sale Form */}
            <Modal open={modalOpen} setOpen={setModalOpen} title="New Sale Order">
                <SaleForm onSave={handleSave} onCancel={() => setModalOpen(false)} />
            </Modal>
        </DashboardLayout>
    );
}
