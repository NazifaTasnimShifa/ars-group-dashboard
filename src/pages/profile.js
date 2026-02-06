// src/pages/profile.js
// User Profile Settings Page
import { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { UserCircleIcon, EnvelopeIcon, LockClosedIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function ProfilePage() {
    const { authFetch, user } = useAppContext();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Email form state
    const [emailForm, setEmailForm] = useState({ currentPassword: '', newEmail: '' });
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailMessage, setEmailMessage] = useState({ type: '', text: '' });
    
    // Password form state
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await authFetch('/api/user/profile');
            const data = await res.json();
            if (data.success) {
                setProfile(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEmailUpdate = async (e) => {
        e.preventDefault();
        setEmailLoading(true);
        setEmailMessage({ type: '', text: '' });

        try {
            const res = await authFetch('/api/user/update-email', {
                method: 'POST',
                body: JSON.stringify(emailForm)
            });
            const data = await res.json();

            if (data.success) {
                setEmailMessage({ type: 'success', text: 'Email updated successfully! Please use your new email to log in next time.' });
                setEmailForm({ currentPassword: '', newEmail: '' });
                fetchProfile();
            } else {
                setEmailMessage({ type: 'error', text: data.message || 'Failed to update email' });
            }
        } catch (error) {
            setEmailMessage({ type: 'error', text: 'An error occurred while updating email' });
        } finally {
            setEmailLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setPasswordLoading(true);
        setPasswordMessage({ type: '', text: '' });

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
            setPasswordLoading(false);
            return;
        }

        try {
            const res = await authFetch('/api/user/update-password', {
                method: 'POST',
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                })
            });
            const data = await res.json();

            if (data.success) {
                setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setPasswordMessage({ type: 'error', text: data.message || 'Failed to update password' });
            }
        } catch (error) {
            setPasswordMessage({ type: 'error', text: 'An error occurred while updating password' });
        } finally {
            setPasswordLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-64">
                    <div className="text-gray-500">Loading profile...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="border-b border-gray-200 pb-5">
                    <h1 className="text-2xl font-semibold leading-6 text-gray-900">Profile Settings</h1>
                    <p className="mt-2 text-sm text-gray-700">Manage your account settings and preferences</p>
                </div>

                {/* Profile Info Card */}
                <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center space-x-4">
                        <UserCircleIcon className="h-16 w-16 text-gray-400" />
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">{profile?.name}</h2>
                            <p className="text-sm text-gray-500">{profile?.role?.displayName || profile?.role?.name}</p>
                            {profile?.business && (
                                <p className="text-sm text-gray-500 mt-1">{profile.business.name}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Email Update Section */}
                <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center mb-4">
                        <EnvelopeIcon className="h-6 w-6 text-gray-400 mr-2" />
                        <h3 className="text-lg font-medium text-gray-900">Email Address</h3>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-4">Current email: <span className="font-medium text-gray-900">{profile?.email}</span></p>

                    <form onSubmit={handleEmailUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">New Email Address</label>
                            <input
                                type="email"
                                value={emailForm.newEmail}
                                onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="newmail@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Current Password</label>
                            <input
                                type="password"
                                value={emailForm.currentPassword}
                                onChange={(e) => setEmailForm({ ...emailForm, currentPassword: e.target.value })}
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="••••••••"
                            />
                            <p className="mt-1 text-sm text-gray-500">Enter your current password to confirm</p>
                        </div>

                        {emailMessage.text && (
                            <div className={`flex items-center gap-2 p-3 rounded-md ${emailMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                {emailMessage.type === 'success' ? (
                                    <CheckCircleIcon className="h-5 w-5" />
                                ) : (
                                    <XCircleIcon className="h-5 w-5" />
                                )}
                                <span className="text-sm">{emailMessage.text}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={emailLoading}
                            className="inline-flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {emailLoading ? 'Updating...' : 'Update Email'}
                        </button>
                    </form>
                </div>

                {/* Password Update Section */}
                <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center mb-4">
                        <LockClosedIcon className="h-6 w-6 text-gray-400 mr-2" />
                        <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                    </div>

                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Current Password</label>
                            <input
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">New Password</label>
                            <input
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                required
                                minLength={6}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="••••••••"
                            />
                            <p className="mt-1 text-sm text-gray-500">Must be at least 6 characters</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                            <input
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="••••••••"
                            />
                        </div>

                        {passwordMessage.text && (
                            <div className={`flex items-center gap-2 p-3 rounded-md ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                {passwordMessage.type === 'success' ? (
                                    <CheckCircleIcon className="h-5 w-5" />
                                ) : (
                                    <XCircleIcon className="h-5 w-5" />
                                )}
                                <span className="text-sm">{passwordMessage.text}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={passwordLoading}
                            className="inline-flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {passwordLoading ? 'Updating...' : 'Change Password'}
                        </button>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
