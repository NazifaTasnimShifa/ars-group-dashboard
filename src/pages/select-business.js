// src/pages/select-business.js
// Business Selection Page for Super Owner

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from '@/contexts/AppContext';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';

export default function SelectBusinessPage() {
  const { user, businesses, switchBusiness, isSuperOwner, loading } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not super owner
    if (!loading && !isSuperOwner) {
      router.push('/dashboard');
    }
  }, [loading, isSuperOwner, router]);

  const handleBusinessSelect = (businessId) => {
    switchBusiness(businessId);
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome, {user?.name}!
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Select a business to view its dashboard
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {businesses.map((business) => (
            <button
              key={business.id}
              onClick={() => handleBusinessSelect(business.id)}
              className="relative group bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 border-2 border-transparent hover:border-indigo-500"
            >
              <div className="flex items-center justify-center mb-4">
                <BuildingOfficeIcon className="h-16 w-16 text-indigo-600 group-hover:text-indigo-700" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">
                {business.name}
              </h2>
              <p className="text-sm text-gray-500 text-center">
                {business.type === 'PETROL_PUMP' ? 'Petrol Pump' : 'Lubricant Business'}
              </p>
              <p className="text-xs text-gray-400 text-center mt-2">
                Code: {business.code}
              </p>
            </button>
          ))}
        </div>

        {businesses.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            No businesses available
          </div>
        )}
      </div>
    </div>
  );
}
