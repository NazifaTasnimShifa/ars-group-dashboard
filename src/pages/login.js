// src/pages/login.js

import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@arsgroup.com');
  const [password, setPassword] = useState('admin123'); // Use the plain text password
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // NEW
  const { login } = useAppContext();

  const handleSubmit = async (e) => { // NEW: async
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password); // NEW: await the result

    setIsLoading(false);
    if (result !== true) {
      setError(result); // Show the error message from the API
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-white shadow-lg rounded-lg">
        {/* ... (Header is the same) ... */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* ... (Input fields are the same) ... */}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading} // NEW: Disable button while loading
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}