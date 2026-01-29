// src/pages/lube/inventory.js
// ARS Lube - Inventory Page

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAppContext } from '@/contexts/AppContext';
import { inventoryData } from '@/data/mockData';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

export default function LubeInventoryPage() {
    const { currentBusiness, formatCurrency } = useAppContext();
    const [inventory, setInventory] = useState([]);

    useEffect(() => {
        const businessKey = currentBusiness?.code === 'ARS-LUBE' ? 'ars_lube' : 'ars_lube';
        setInventory(inventoryData[businessKey] || inventoryData.ars_lube);
    }, [currentBusiness]);

    const getStatusBadge = (status) => {
        const styles = {
            'In Stock': 'bg-green-100 text-green-800',
            'Low Stock': 'bg-yellow-100 text-yellow-800',
            'Out of Stock': 'bg-red-100 text-red-800',
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
                        <h1 className="text-2xl font-bold text-gray-900">Lube Inventory</h1>
                        <p className="mt-1 text-sm text-gray-500">View and manage lubricant stock levels</p>
                    </div>
                    <button className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                        <PlusCircleIcon className="h-5 w-5" />
                        Add Product
                    </button>
                </div>

                <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cost Price</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Sale Price</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {inventory.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.sku}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{item.stock} {item.unit}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{formatCurrency(item.costPrice)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{formatCurrency(item.salePrice)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">{getStatusBadge(item.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
