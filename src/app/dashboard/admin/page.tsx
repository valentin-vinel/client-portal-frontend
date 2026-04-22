'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useProjects } from '@/hooks/use-projects';
import { useDeleteProject } from '@/hooks/use-project-mutations';
import { Navbar } from '@/components/navbar';

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { data, isLoading: isLoadingProjects } = useProjects(1, 100);
  const deleteProject = useDeleteProject();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-sm">Chargement...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  function handleDelete(projectId: number, projectName: string) {
    if (!confirm(`Supprimer le projet "${projectName}" ? Cette action est irréversible.`)) return;
    deleteProject.mutate(projectId);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Tous les projets</h2>
          <button
            onClick={() => router.push('/dashboard/admin/projects/new')}
            className="bg-blue-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Nouveau projet
          </button>
        </div>

        {isLoadingProjects ? (
          <p className="text-gray-500 text-sm">Chargement des projets...</p>
        ) : data?.data.length === 0 ? (
          <p className="text-gray-500 text-sm">Aucun projet pour le moment.</p>
        ) : (
          <div className="grid gap-4">
            {data?.data.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-gray-100 p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{project.client}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      project.status === 'done'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}>
                      {project.status === 'done' ? 'Terminé' : 'En cours'}
                    </span>
                    <button
                      onClick={() => router.push(`/dashboard/admin/projects/${project.id}/edit`)}
                      className="text-sm text-gray-600 hover:text-gray-900 bg-gray-50 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(project.id, project.name)}
                      disabled={deleteProject.isPending}
                      className="bg-red-50 text-red-600 py-2 px-3 rounded-lg text-sm hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
