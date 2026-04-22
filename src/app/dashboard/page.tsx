'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useProjects } from '@/hooks/use-projects';

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const { data, isLoading: isLoadingProjects } = useProjects();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-sm">Chargement...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Client Portal</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user.email}</span>
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

      <main className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Mes projets</h2>

        {isLoadingProjects ? (
          <p className="text-gray-500 text-sm">Chargement des projets...</p>
        ) : data?.data.length === 0 ? (
          <p className="text-gray-500 text-sm">Aucun projet pour le moment.</p>
        ) : (
          <div className="grid gap-4">
            {data?.data.map((project) => (
              <div
                key={project.id}
                onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                className="bg-white rounded-xl border border-gray-100 p-5 cursor-pointer hover:border-blue-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{project.client}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    project.status === 'done'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-blue-50 text-blue-700'
                  }`}>
                    {project.status === 'done' ? 'Terminé' : 'En cours'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}