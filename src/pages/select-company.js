// src/pages/select-company.js

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from '@/contexts/AppContext';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline';

export default function SelectCompanyPage() {
  const { user, companies, selectCompany, logout, loading } = useAppContext();
  const router = useRouter();

  // --- SECURITY CHECK ---
  useEffect(() => {
    if (!loading && user) {
      // If a normal user tries to access this page, kick them to dashboard
      if (user.role !== 'admin') {
        router.replace('/dashboard');
      }
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // If user is admin, show the selection
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0 h-screen">
        <div className="w-full max-w-md p-8 space-y-8 bg-white shadow-lg rounded-lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome, {user.name}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              You are logged in as an <strong>Admin</strong>. <br/>
              Please select a company to manage.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {companies.map((company) => (
              <button
                key={company.id}
                onClick={() => selectCompany(company.id)}
                className="w-full flex items-center justify-start p-4 text-left text-gray-700 bg-gray-50 rounded-lg hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                <div className="p-2 bg-indigo-200 rounded-full">
                  <BuildingOffice2Icon className="h-6 w-6 text-indigo-600" />
                </div>
                <span className="ml-4 font-semibold text-lg">{company.name}</span>
              </button>
            ))}
          </div>

          <div className="text-center mt-6">
              <button
                  onClick={logout}
                  className="text-sm text-gray-500 hover:text-indigo-600 hover:underline"
              >
                  Or, sign out
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}