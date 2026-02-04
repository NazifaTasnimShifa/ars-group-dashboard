// src/pages/owner/users.js
// Owner Panel - User Management Page
// Only accessible by Super Owner role

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Modal from '@/components/ui/Modal';
import UserForm from '@/components/forms/UserForm';
import { useAppContext } from '@/contexts/AppContext';
import {
    UserPlusIcon,
    PencilSquareIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    CheckCircleIcon,
    XCircleIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline';

export default function UserManagementPage() {
    const router = useRouter();
    const { authFetch, isSuperOwner, loading: authLoading, businesses } = useAppContext();

    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filter/Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [filterBusiness, setFilterBusiness] = useState('');
    const [showInactive, setShowInactive] = useState(false);

    // Modal state
    const [modalState, setModalState] = useState({
        open: false,
        mode: 'create', // 'create' or 'edit'
        user: null
    });

    // Delete confirmation state
    const [deleteConfirm, setDeleteConfirm] = useState({
        open: false,
        user: null
    });

    // Redirect non-super-owners
    useEffect(() => {
        if (!authLoading && !isSuperOwner) {
            router.push('/dashboard');
        }
    }, [authLoading, isSuperOwner, router]);

    // Fetch users
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            let url = '/api/users?';
            const params = new URLSearchParams();

            if (searchQuery) params.append('search', searchQuery);
            if (filterRole) params.append('roleId', filterRole);
            if (filterBusiness && filterBusiness !== 'all') params.append('businessId', filterBusiness);
            if (showInactive) params.append('includeInactive', 'true');

            const res = await authFetch(`/api/users?${params.toString()}`);
            const data = await res.json();

            if (data.success) {
                setUsers(data.data);
            } else {
                setError(data.message || 'Failed to fetch users');
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    }, [authFetch, searchQuery, filterRole, filterBusiness, showInactive]);

    // Fetch roles
    const fetchRoles = useCallback(async () => {
        try {
            const res = await authFetch('/api/roles');
            const data = await res.json();
            if (data.success) {
                setRoles(data.data);
            }
        } catch (err) {
            console.error('Error fetching roles:', err);
        }
    }, [authFetch]);

    useEffect(() => {
        if (isSuperOwner) {
            fetchUsers();
            fetchRoles();
        }
    }, [isSuperOwner, fetchUsers, fetchRoles]);

    // Handle search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isSuperOwner) {
                fetchUsers();
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, filterRole, filterBusiness, showInactive, isSuperOwner, fetchUsers]);

    // Handle save user (create or update)
    const handleSaveUser = async (userData) => {
        try {
            const isEditing = modalState.mode === 'edit';
            const url = isEditing ? `/api/users/${modalState.user.id}` : '/api/users';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await authFetch(url, {
                method,
                body: JSON.stringify(userData)
            });

            const data = await res.json();

            if (data.success) {
                setModalState({ open: false, mode: 'create', user: null });
                fetchUsers();
            } else {
                throw new Error(data.message || 'Failed to save user');
            }
        } catch (err) {
            throw err;
        }
    };

    // Handle delete user
    const handleDeleteUser = async () => {
        if (!deleteConfirm.user) return;

        try {
            const res = await authFetch(`/api/users/${deleteConfirm.user.id}`, {
                method: 'DELETE'
            });

            const data = await res.json();

            if (data.success) {
                setDeleteConfirm({ open: false, user: null });
                fetchUsers();
            } else {
                alert(data.message || 'Failed to delete user');
            }
        } catch (err) {
            console.error('Error deleting user:', err);
            alert('Failed to delete user');
        }
    };

    // Open modals
    const openCreateModal = () => {
        setModalState({ open: true, mode: 'create', user: null });
    };

    const openEditModal = (user) => {
        setModalState({ open: true, mode: 'edit', user });
    };

    const openDeleteConfirm = (user) => {
        setDeleteConfirm({ open: true, user });
    };

    if (authLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!isSuperOwner) {
        return null;
    }

    return (
        <DashboardLayout>
            {/* Create/Edit User Modal */}
            <Modal
                open={modalState.open}
                setOpen={(val) => setModalState(prev => ({ ...prev, open: val }))}
                title={modalState.mode === 'edit' ? 'Edit User' : 'Add New User'}
            >
                <UserForm
                    user={modalState.user}
                    onSave={handleSaveUser}
                    onCancel={() => setModalState({ open: false, mode: 'create', user: null })}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                open={deleteConfirm.open}
                setOpen={(val) => setDeleteConfirm(prev => ({ ...prev, open: val }))}
                title="Confirm Deactivation"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Are you sure you want to deactivate <strong>{deleteConfirm.user?.name}</strong>?
                        They will no longer be able to log in to the system.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setDeleteConfirm({ open: false, user: null })}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteUser}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                        >
                            Deactivate User
                        </button>
                    </div>
                </div>
            </Modal>

            <div className="space-y-6">
                {/* Header */}
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <UserGroupIcon className="h-7 w-7 text-indigo-600" />
                            User Management
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage users, roles, and company assignments
                        </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="mt-4 sm:mt-0 inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    >
                        <UserPlusIcon className="h-5 w-5" />
                        Add User
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Search */}
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Role Filter */}
                        <div className="flex items-center gap-2">
                            <FunnelIcon className="h-5 w-5 text-gray-400" />
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                                <option value="">All Roles</option>
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>{role.displayName}</option>
                                ))}
                            </select>
                        </div>

                        {/* Business Filter */}
                        <select
                            value={filterBusiness}
                            onChange={(e) => setFilterBusiness(e.target.value)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="">All Companies</option>
                            {businesses.map(business => (
                                <option key={business.id} value={business.id}>{business.shortName}</option>
                            ))}
                        </select>

                        {/* Show Inactive Toggle */}
                        <label className="flex items-center gap-2 text-sm text-gray-600">
                            <input
                                type="checkbox"
                                checked={showInactive}
                                onChange={(e) => setShowInactive(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                            />
                            Show inactive
                        </label>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Company
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Last Login
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="flex justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    users.map(user => (
                                        <tr key={user.id} className={!user.isActive ? 'bg-gray-50' : ''}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role?.name === 'super_owner'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : user.role?.name === 'manager'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {user.role?.displayName || 'Unknown'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.business?.shortName || (user.role?.name === 'super_owner' ? 'All Companies' : '—')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {user.isActive ? (
                                                    <span className="inline-flex items-center gap-1 text-sm text-green-600">
                                                        <CheckCircleIcon className="h-4 w-4" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-sm text-gray-400">
                                                        <XCircleIcon className="h-4 w-4" />
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.lastLoginAt
                                                    ? new Date(user.lastLoginAt).toLocaleDateString('en-GB', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })
                                                    : 'Never'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                    title="Edit user"
                                                >
                                                    <PencilSquareIcon className="h-5 w-5" />
                                                </button>
                                                {user.role?.name !== 'super_owner' && (
                                                    <button
                                                        onClick={() => openDeleteConfirm(user)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Deactivate user"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer with count */}
                    <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                            Showing {users.length} user{users.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
