'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <h1
          onClick={() => router.push('/dashboard')}
          className="text-lg font-semibold text-gray-900 cursor-pointer"
        >
          Client Portal
        </h1>
        {user?.role === 'admin' && (
          <button
            onClick={() => router.push('/dashboard/admin')}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Administration
          </button>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">{user?.email}</span>
        <button
          onClick={() => {
            logout();
            router.push('/login');
          }}
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          Déconnexion
        </button>
      </div>
    </nav>
  );
}