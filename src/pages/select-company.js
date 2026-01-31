// src/pages/select-company.js
// ARS ERP - Company Selection Page
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from '@/contexts/AppContext';
import { BuildingOffice2Icon, ArrowRightStartOnRectangleIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

export default function SelectCompanyPage() {
  const { user, businesses, switchBusiness, logout, loading, isSuperOwner } = useAppContext();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      // If not Super Owner, redirect to dashboard
      if (!isSuperOwner) {
        router.replace('/dashboard');
      }
    } else if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router, isSuperOwner]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Handle business selection with proper navigation
  const handleSelectBusiness = async (businessId) => {
    if (isNavigating) return;
    setIsNavigating(true);
    
    // Update the business context
    switchBusiness(businessId);
    
    // Navigate to dashboard
    await router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Select Company</h2>
          <p className="mt-2 text-sm text-gray-600">Logged in as {user.name}</p>
        </div>

        <div className="space-y-4">
          {/* Combined View Option */}
          <button
            onClick={() => handleSelectBusiness('all')}
            disabled={isNavigating}
            className="w-full flex items-center p-4 text-left bg-indigo-50 rounded-lg hover:bg-indigo-100 hover:ring-1 hover:ring-indigo-500 transition-all disabled:opacity-50"
          >
            <div className="p-2 bg-indigo-200 rounded-lg text-indigo-700 mr-4">
              <GlobeAltIcon className="h-6 w-6" />
            </div>
            <div>
              <span className="font-semibold text-gray-900">All Companies</span>
              <p className="text-xs text-gray-500">Combined view of all data</p>
            </div>
          </button>

          {/* Individual Companies */}
          {businesses && businesses.length > 0 ? (
            businesses.map((business) => (
              <button
                key={business.id}
                onClick={() => handleSelectBusiness(business.id)}
                disabled={isNavigating}
                className="w-full flex items-center p-4 text-left bg-gray-50 rounded-lg hover:bg-indigo-50 hover:ring-1 hover:ring-indigo-500 transition-all disabled:opacity-50"
              >
                <div className="p-2 bg-gray-200 rounded-lg text-gray-600 mr-4">
                  <BuildingOffice2Icon className="h-6 w-6" />
                </div>
                <div>
                  <span className="font-semibold text-gray-900">{business.name}</span>
                  <p className="text-xs text-gray-500">
                    {business.type === 'PETROL_PUMP' ? 'Fuel Station' : 'Lubricant Distribution'}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">
              Loading companies...
            </div>
          )}
        </div>

        <button 
          onClick={logout} 
          disabled={isNavigating}
          className="mt-8 w-full flex justify-center items-center text-sm text-gray-500 hover:text-red-600 disabled:opacity-50"
        >
          <ArrowRightStartOnRectangleIcon className="h-4 w-4 mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
