// src/pages/select-company.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from '@/contexts/AppContext';
import { BuildingOffice2Icon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';

export default function SelectCompanyPage() {
  const { user, companies, selectCompany, logout, loading } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role !== 'admin') {
        router.replace('/dashboard');
      }
    } else if (!loading && !user) {
        router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Select Company</h2>
          <p className="mt-2 text-sm text-gray-600">Logged in as {user.name}</p>
        </div>

        <div className="space-y-4">
          {companies.map((company) => (
            <button
              key={company.id}
              onClick={() => selectCompany(company.id)}
              className="w-full flex items-center p-4 text-left bg-gray-50 rounded-lg hover:bg-indigo-50 hover:ring-1 hover:ring-indigo-500 transition-all"
            >
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 mr-4">
                <BuildingOffice2Icon className="h-6 w-6" />
              </div>
              <span className="font-semibold text-gray-900">{company.name}</span>
            </button>
          ))}
        </div>

        <button onClick={logout} className="mt-8 w-full flex justify-center items-center text-sm text-gray-500 hover:text-red-600">
          <ArrowRightStartOnRectangleIcon className="h-4 w-4 mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  );
}