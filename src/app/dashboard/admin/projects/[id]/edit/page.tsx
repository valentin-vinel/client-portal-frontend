'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProject } from '@/hooks/use-project';
import {
  useUpdateProject,
  useCreateStep, useUpdateStep, useDeleteStep,
  useCreateReport, useUpdateReport, useDeleteReport,
  useCreateDocument, useUpdateDocument, useDeleteDocument,
} from '@/hooks/use-project-mutations';
import { Navbar } from '@/components/navbar';
import { Step, Report, Document } from '@/types';

export default function EditProjectPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = Number(params.id);
  const { data: project, isLoading: isLoadingProject } = useProject(projectId);

  // Projet
  const updateProject = useUpdateProject(projectId);
  const [projectName, setProjectName] = useState('');
  const [projectClient, setProjectClient] = useState('');
  const [projectStatus, setProjectStatus] = useState('');
  const [projectError, setProjectError] = useState('');
  const [projectSaved, setProjectSaved] = useState(false);

  // Étapes
  const createStep = useCreateStep(projectId);
  const updateStep = useUpdateStep(projectId);
  const deleteStep = useDeleteStep(projectId);
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepDesc, setNewStepDesc] = useState('');
  const [editingStep, setEditingStep] = useState<Step | null>(null);

  // Comptes rendus
  const createReport = useCreateReport(projectId);
  const updateReport = useUpdateReport(projectId);
  const deleteReport = useDeleteReport(projectId);
  const [newReportTitle, setNewReportTitle] = useState('');
  const [newReportContent, setNewReportContent] = useState('');
  const [editingReport, setEditingReport] = useState<Report | null>(null);

  // Documents
  const createDocument = useCreateDocument(projectId);
  const updateDocument = useUpdateDocument(projectId);
  const deleteDocument = useDeleteDocument(projectId);
  const [newDocName, setNewDocName] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');
  const [newDocType, setNewDocType] = useState('');
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (project) {
      setProjectName(project.name);
      setProjectClient(project.client);
      setProjectStatus(project.status);
    }
  }, [project]);

  if (isLoading || isLoadingProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-sm">Chargement...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin' || !project) return null;

  // --- Handlers projet ---
  function handleUpdateProject(e: React.FormEvent) {
    e.preventDefault();
    setProjectError('');
    setProjectSaved(false);
    updateProject.mutate(
      { name: projectName.trim(), client: projectClient.trim(), status: projectStatus },
      {
        onSuccess: () => setProjectSaved(true),
        onError: (err) => setProjectError(err.message),
      }
    );
  }

  // --- Handlers étapes ---
  function handleCreateStep(e: React.FormEvent) {
    e.preventDefault();
    if (!newStepTitle.trim()) return;
    const order = (project?.steps?.length ?? 0) + 1;
    createStep.mutate(
      { title: newStepTitle.trim(), description: newStepDesc.trim() || undefined, status: 'pending', order },
      {
        onSuccess: () => { setNewStepTitle(''); setNewStepDesc(''); },
      }
    );
  }

  function handleUpdateStep(e: React.FormEvent) {
    e.preventDefault();
    if (!editingStep) return;
    updateStep.mutate(
      { stepId: editingStep.id, data: { title: editingStep.title, description: editingStep.description, status: editingStep.status } },
      { onSuccess: () => setEditingStep(null) }
    );
  }

  function handleDeleteStep(stepId: number) {
    if (!confirm('Supprimer cette étape ?')) return;
    deleteStep.mutate(stepId);
  }

  // --- Handlers comptes rendus ---
  function handleCreateReport(e: React.FormEvent) {
    e.preventDefault();
    if (!newReportTitle.trim() || !newReportContent.trim()) return;
    createReport.mutate(
      { title: newReportTitle.trim(), content: newReportContent.trim() },
      { onSuccess: () => { setNewReportTitle(''); setNewReportContent(''); } }
    );
  }

  function handleUpdateReport(e: React.FormEvent) {
    e.preventDefault();
    if (!editingReport) return;
    updateReport.mutate(
      { reportId: editingReport.id, data: { title: editingReport.title, content: editingReport.content } },
      { onSuccess: () => setEditingReport(null) }
    );
  }

  function handleDeleteReport(reportId: number) {
    if (!confirm('Supprimer ce compte rendu ?')) return;
    deleteReport.mutate(reportId);
  }

  // --- Handlers documents ---
  function handleCreateDocument(e: React.FormEvent) {
    e.preventDefault();
    if (!newDocName.trim() || !newDocUrl.trim() || !newDocType.trim()) return;
    createDocument.mutate(
      { name: newDocName.trim(), url: newDocUrl.trim(), type: newDocType.trim() },
      { onSuccess: () => { setNewDocName(''); setNewDocUrl(''); setNewDocType(''); } }
    );
  }

  function handleUpdateDocument(e: React.FormEvent) {
    e.preventDefault();
    if (!editingDocument) return;
    updateDocument.mutate(
      { documentId: editingDocument.id, data: { name: editingDocument.name, url: editingDocument.url, type: editingDocument.type } },
      { onSuccess: () => setEditingDocument(null) }
    );
  }

  function handleDeleteDocument(documentId: number) {
    if (!confirm('Supprimer ce document ?')) return;
    deleteDocument.mutate(documentId);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/admin')}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            ← Retour
          </button>
          <h2 className="text-xl font-semibold text-gray-900">Modifier le projet</h2>
        </div>

        {/* Infos projet */}
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Informations générales</h3>
          <form onSubmit={handleUpdateProject} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom du projet</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Client</label>
              <input
                type="text"
                value={projectClient}
                onChange={(e) => setProjectClient(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Statut</label>
              <select
                value={projectStatus}
                onChange={(e) => setProjectStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="in_progress">En cours</option>
                <option value="done">Terminé</option>
              </select>
            </div>
            {projectError && <p className="text-red-600 text-sm">{projectError}</p>}
            {projectSaved && <p className="text-green-600 text-sm">Modifications enregistrées.</p>}
            <button
              type="submit"
              disabled={updateProject.isPending}
              className="bg-blue-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {updateProject.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </form>
        </section>

        {/* Étapes */}
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Étapes</h3>

          <div className="space-y-3 mb-5">
            {project.steps?.length === 0 && (
              <p className="text-gray-500 text-sm">Aucune étape.</p>
            )}
            {project.steps?.map((step) => (
              <div key={step.id}>
                {editingStep?.id === step.id ? (
                  <form onSubmit={handleUpdateStep} className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <input
                      type="text"
                      value={editingStep.title}
                      onChange={(e) => setEditingStep({ ...editingStep, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={editingStep.description ?? ''}
                      onChange={(e) => setEditingStep({ ...editingStep, description: e.target.value })}
                      placeholder="Description (optionnelle)"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={editingStep.status}
                      onChange={(e) => setEditingStep({ ...editingStep, status: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="pending">À faire</option>
                      <option value="in_progress">En cours</option>
                      <option value="done">Terminé</option>
                    </select>
                    <div className="flex gap-2">
                      <button type="submit" disabled={updateStep.isPending} className="bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                        Sauvegarder
                      </button>
                      <button type="button" onClick={() => setEditingStep(null)} className="text-sm text-gray-500 hover:text-gray-900 px-3 py-2">
                        Annuler
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                      step.status === 'done' ? 'bg-green-100 text-green-700'
                      : step.status === 'in_progress' ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-500'
                    }`}>
                      {step.order}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{step.title}</p>
                      {step.description && <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      step.status === 'done' ? 'bg-green-50 text-green-700'
                      : step.status === 'in_progress' ? 'bg-blue-50 text-blue-700'
                      : 'bg-gray-50 text-gray-500'
                    }`}>
                      {step.status === 'done' ? 'Terminé' : step.status === 'in_progress' ? 'En cours' : 'À faire'}
                    </span>
                    <button onClick={() => setEditingStep(step)} className="text-sm text-gray-500 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-50">
                      Modifier
                    </button>
                    <button onClick={() => handleDeleteStep(step.id)} className="bg-red-50 text-red-600 py-1 px-2 rounded text-sm hover:bg-red-100">
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleCreateStep} className="border-t border-gray-100 pt-4 space-y-3">
            <p className="text-sm font-medium text-gray-700">Ajouter une étape</p>
            <input
              type="text"
              value={newStepTitle}
              onChange={(e) => setNewStepTitle(e.target.value)}
              placeholder="Titre de l'étape"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={newStepDesc}
              onChange={(e) => setNewStepDesc(e.target.value)}
              placeholder="Description (optionnelle)"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={createStep.isPending || !newStepTitle.trim()}
              className="bg-blue-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {createStep.isPending ? 'Ajout...' : 'Ajouter'}
            </button>
          </form>
        </section>

        {/* Comptes rendus */}
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Comptes rendus</h3>

          <div className="space-y-3 mb-5">
            {project.reports?.length === 0 && (
              <p className="text-gray-500 text-sm">Aucun compte rendu.</p>
            )}
            {project.reports?.map((report) => (
              <div key={report.id}>
                {editingReport?.id === report.id ? (
                  <form onSubmit={handleUpdateReport} className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <input
                      type="text"
                      value={editingReport.title}
                      onChange={(e) => setEditingReport({ ...editingReport, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      value={editingReport.content}
                      onChange={(e) => setEditingReport({ ...editingReport, content: e.target.value })}
                      rows={4}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <div className="flex gap-2">
                      <button type="submit" disabled={updateReport.isPending} className="bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                        Sauvegarder
                      </button>
                      <button type="button" onClick={() => setEditingReport(null)} className="text-sm text-gray-500 hover:text-gray-900 px-3 py-2">
                        Annuler
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-4 rounded-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{report.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{new Date(report.createdAt).toLocaleDateString('fr-FR')}</span>
                        <button onClick={() => setEditingReport(report)} className="text-sm text-gray-500 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-50">
                          Modifier
                        </button>
                        <button onClick={() => handleDeleteReport(report.id)} className="bg-red-50 text-red-600 py-1 px-2 rounded text-sm hover:bg-red-100">
                          Supprimer
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{report.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleCreateReport} className="border-t border-gray-100 pt-4 space-y-3">
            <p className="text-sm font-medium text-gray-700">Ajouter un compte rendu</p>
            <input
              type="text"
              value={newReportTitle}
              onChange={(e) => setNewReportTitle(e.target.value)}
              placeholder="Titre"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              value={newReportContent}
              onChange={(e) => setNewReportContent(e.target.value)}
              placeholder="Contenu du compte rendu..."
              rows={4}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <button
              type="submit"
              disabled={createReport.isPending || !newReportTitle.trim() || !newReportContent.trim()}
              className="bg-blue-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {createReport.isPending ? 'Ajout...' : 'Ajouter'}
            </button>
          </form>
        </section>

        {/* Documents */}
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Documents</h3>

          <div className="space-y-3 mb-5">
            {project.documents?.length === 0 && (
              <p className="text-gray-500 text-sm">Aucun document.</p>
            )}
            {project.documents?.map((doc) => (
              <div key={doc.id}>
                {editingDocument?.id === doc.id ? (
                  <form onSubmit={handleUpdateDocument} className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <input
                      type="text"
                      value={editingDocument.name}
                      onChange={(e) => setEditingDocument({ ...editingDocument, name: e.target.value })}
                      placeholder="Nom du document"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="url"
                      value={editingDocument.url}
                      onChange={(e) => setEditingDocument({ ...editingDocument, url: e.target.value })}
                      placeholder="URL"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={editingDocument.type}
                      onChange={(e) => setEditingDocument({ ...editingDocument, type: e.target.value })}
                      placeholder="Type (ex: PDF, ZIP)"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-2">
                      <button type="submit" disabled={updateDocument.isPending} className="bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                        Sauvegarder
                      </button>
                      <button type="button" onClick={() => setEditingDocument(null)} className="text-sm text-gray-500 hover:text-gray-900 px-3 py-2">
                        Annuler
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{doc.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5 uppercase">{doc.type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:text-blue-700 px-2 py-1">
                        ↗ Ouvrir
                      </a>
                      <button onClick={() => setEditingDocument(doc)} className="text-sm text-gray-500 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-50">
                        Modifier
                      </button>
                      <button onClick={() => handleDeleteDocument(doc.id)} className="bg-red-50 text-red-600 py-1 px-2 rounded text-sm hover:bg-red-100">
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleCreateDocument} className="border-t border-gray-100 pt-4 space-y-3">
            <p className="text-sm font-medium text-gray-700">Ajouter un document</p>
            <input
              type="text"
              value={newDocName}
              onChange={(e) => setNewDocName(e.target.value)}
              placeholder="Nom du document"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="url"
              value={newDocUrl}
              onChange={(e) => setNewDocUrl(e.target.value)}
              placeholder="URL du document"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={newDocType}
              onChange={(e) => setNewDocType(e.target.value)}
              placeholder="Type (ex: PDF, ZIP, DOCX)"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={createDocument.isPending || !newDocName.trim() || !newDocUrl.trim() || !newDocType.trim()}
              className="bg-blue-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {createDocument.isPending ? 'Ajout...' : 'Ajouter'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
