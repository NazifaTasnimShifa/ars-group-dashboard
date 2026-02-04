// src/components/forms/UserForm.js
// Form component for creating and editing users

import { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';

export default function UserForm({ user, onSave, onCancel }) {
    const { authFetch, businesses } = useAppContext();
    const isEditing = !!user;

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        confirmPassword: '',
        phone: user?.phone || '',
        roleId: user?.role?.id || '',
        businessId: user?.business?.id || '',
        isActive: user?.isActive ?? true
    });

    const [roles, setRoles] = useState([]);
    const [allBusinesses, setAllBusinesses] = useState(businesses || []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch roles on mount
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const res = await authFetch('/api/roles');
                const data = await res.json();
                if (data.success) {
                    setRoles(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch roles:', err);
            }
        };

        const fetchBusinesses = async () => {
            try {
                const res = await authFetch('/api/businesses');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setAllBusinesses(data);
                }
            } catch (err) {
                console.error('Failed to fetch businesses:', err);
            }
        };

        fetchRoles();
        if (!businesses || businesses.length === 0) {
            fetchBusinesses();
        }
    }, [authFetch, businesses]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation
        if (!formData.name || !formData.email || !formData.roleId) {
            setError('Name, email, and role are required');
            setLoading(false);
            return;
        }

        // Password validation for new users
        if (!isEditing && !formData.password) {
            setError('Password is required for new users');
            setLoading(false);
            return;
        }

        if (formData.password && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        // Check if role requires business assignment
        const selectedRole = roles.find(r => r.id === formData.roleId);
        if (selectedRole && selectedRole.name !== 'super_owner' && !formData.businessId) {
            setError('Business assignment is required for this role');
            setLoading(false);
            return;
        }

        try {
            // Build payload
            const payload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone || null,
                roleId: formData.roleId,
                businessId: formData.businessId || null,
                isActive: formData.isActive
            };

            // Only include password if provided
            if (formData.password) {
                payload.password = formData.password;
            }

            await onSave(payload);
        } catch (err) {
            setError(err.message || 'Failed to save user');
        } finally {
            setLoading(false);
        }
    };

    const selectedRole = roles.find(r => r.id === formData.roleId);
    const isSuperOwnerRole = selectedRole?.name === 'super_owner';

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Name */}
                <div className="sm:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Enter full name"
                    />
                </div>

                {/* Email */}
                <div className="sm:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address *
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="user@example.com"
                    />
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password {!isEditing && '*'}
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required={!isEditing}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder={isEditing ? 'Leave blank to keep current' : 'Enter password'}
                    />
                </div>

                {/* Confirm Password */}
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm Password {!isEditing && '*'}
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required={!isEditing || formData.password.length > 0}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Confirm password"
                    />
                </div>

                {/* Phone */}
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="+880 1XXX-XXXXXX"
                    />
                </div>

                {/* Role */}
                <div>
                    <label htmlFor="roleId" className="block text-sm font-medium text-gray-700">
                        Role *
                    </label>
                    <select
                        id="roleId"
                        name="roleId"
                        value={formData.roleId}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                        <option value="">Select a role</option>
                        {roles.map(role => (
                            <option key={role.id} value={role.id}>
                                {role.displayName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Business (only if not super_owner role) */}
                {!isSuperOwnerRole && (
                    <div className="sm:col-span-2">
                        <label htmlFor="businessId" className="block text-sm font-medium text-gray-700">
                            Assign to Company {!isSuperOwnerRole && '*'}
                        </label>
                        <select
                            id="businessId"
                            name="businessId"
                            value={formData.businessId}
                            onChange={handleChange}
                            required={!isSuperOwnerRole}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="">Select a company</option>
                            {allBusinesses.map(business => (
                                <option key={business.id} value={business.id}>
                                    {business.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Active Status (only for editing) */}
                {isEditing && (
                    <div className="sm:col-span-2">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Account is active</span>
                        </label>
                    </div>
                )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
                >
                    {loading ? 'Saving...' : (isEditing ? 'Update User' : 'Create User')}
                </button>
            </div>
        </form>
    );
}
