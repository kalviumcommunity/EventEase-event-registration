'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    setUpdating(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(users.map((u) => (u.id === userId ? data.user : u)));
      } else {
        console.error('Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    } finally {
      setUpdating(null);
    }
  };

  const toggleRole = (userId: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'VIEWER' : 'ADMIN';
    updateUserRole(userId, newRole);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            SuperAdmin Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage user roles and permissions across the system
          </p>
        </div>

        {/* Current Admin Info */}
        <div className="mb-8 bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Current Session
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                Logged in as:{' '}
                <span className="font-semibold">{user?.name}</span>
              </p>
              <p>
                Email: <span className="font-semibold">{user?.email}</span>
              </p>
              <p>
                Role:{' '}
                <span className="font-semibold text-indigo-600">
                  {user?.role}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              User Management
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Toggle user roles between ADMIN and VIEWER. Only users with ADMIN
              role can access administrative features.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Current Role
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Created
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'ADMIN'
                            ? 'bg-red-100 text-red-800'
                            : user.role === 'EDITOR'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => toggleRole(user.id, user.role)}
                        disabled={updating === user.id}
                        className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${
                          user.role === 'ADMIN'
                            ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                            : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {updating === user.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : null}
                        {user.role === 'ADMIN'
                          ? 'Demote to VIEWER'
                          : 'Promote to ADMIN'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found.</p>
            </div>
          )}
        </div>

        {/* Role Information */}
        <div className="mt-8 bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Role Permissions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  ADMIN
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Create events</li>
                  <li>• Read events</li>
                  <li>• Update events</li>
                  <li>• Delete events</li>
                  <li>• Manage users</li>
                </ul>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  EDITOR
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Create events</li>
                  <li>• Read events</li>
                  <li>• Update events</li>
                  <li className="text-gray-400">• Delete events (No)</li>
                  <li className="text-gray-400">• Manage users (No)</li>
                </ul>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  VIEWER
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Read events</li>
                  <li className="text-gray-400">• Create events (No)</li>
                  <li className="text-gray-400">• Update events (No)</li>
                  <li className="text-gray-400">• Delete events (No)</li>
                  <li className="text-gray-400">• Manage users (No)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
