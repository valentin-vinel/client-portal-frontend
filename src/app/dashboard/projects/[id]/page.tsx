'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useProject } from '@/hooks/use-project';

export default function ProjectPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = Number(params.id);
  const { data: project, isLoading: isLoadingProject } = useProject(projectId);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || isLoadingProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-sm">Chargement...</p>
      </div>
    );
  }

  if (!user || !project) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            ← Retour
          </button>
          <h1 className="text-lg font-semibold text-gray-900">{project.name}</h1>
        </div>
        <span className="text-sm text-gray-500">{user.email}</span>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Étapes */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Étapes du projet</h2>
          {project.steps?.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucune étape définie.</p>
          ) : (
            <div className="space-y-3">
              {project.steps?.map((step, index) => (
                <div key={step.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.status === 'done'
                      ? 'bg-green-100 text-green-700'
                      : step.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{step.title}</p>
                    {step.description && (
                      <p className="text-gray-500 text-xs mt-0.5">{step.description}</p>
                    )}
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    step.status === 'done'
                      ? 'bg-green-50 text-green-700'
                      : step.status === 'in_progress'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-gray-50 text-gray-500'
                  }`}>
                    {step.status === 'done' ? 'Terminé' : step.status === 'in_progress' ? 'En cours' : 'À faire'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Comptes rendus */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Comptes rendus</h2>
          {project.reports?.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucun compte rendu disponible.</p>
          ) : (
            <div className="space-y-3">
              {project.reports?.map((report) => (
                <div key={report.id} className="bg-white rounded-xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 text-sm">{report.title}</h3>
                    <span className="text-xs text-gray-400">
                      {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{report.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Documents */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents</h2>
          {project.documents?.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucun document disponible.</p>
          ) : (
            <div className="grid gap-3">
              {project.documents?.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between hover:border-blue-200 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{doc.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5 uppercase">{doc.type}</p>
                  </div>
                  <span className="text-blue-600 text-sm">↗</span>
                </a>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}