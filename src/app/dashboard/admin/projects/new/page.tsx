'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { useCreateProject } from '@/hooks/use-project-mutations';
import { useProjects } from '@/hooks/use-projects';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Navbar } from '@/components/navbar';
import { User } from '@/types';

export default function NewProjectPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const createProject = useCreateProject();
  const { data: projectsData } = useProjects(1, 100);

  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');

  // Création de compte client
  const [showRegister, setShowRegister] = useState(false);
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  const registerClient = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post<User & { access_token?: string }>('/auth/register', data),
  });

  // Clients connus extraits des projets existants
  const knownClients = useMemo<User[]>(() => {
    const map = new Map<number, User>();
    projectsData?.data.forEach((p) => {
      if (p.user && p.user.role === 'client' && !map.has(p.user.id)) {
        map.set(p.user.id, p.user);
      }
    });
    return Array.from(map.values());
  }, [projectsData]);

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const userIdNum = Number(userId);
    if (!name.trim() || !client.trim() || !userIdNum) {
      setError('Tous les champs sont requis.');
      return;
    }

    createProject.mutate(
      { name: name.trim(), client: client.trim(), userId: userIdNum },
      {
        onSuccess: () => router.push('/dashboard/admin'),
        onError: (err) => setError(err.message),
      }
    );
  }

  function handleRegisterClient(e: React.FormEvent) {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');

    if (!registerEmail.trim() || !registerPassword.trim()) {
      setRegisterError('Email et mot de passe requis.');
      return;
    }

    registerClient.mutate(
      { email: registerEmail.trim(), password: registerPassword.trim() },
      {
        onSuccess: (data) => {
          // Si l'API retourne l'id du compte créé, on l'auto-remplit
          if (data?.id) {
            setUserId(String(data.id));
            setRegisterSuccess(`Compte créé (ID : ${data.id}). Sélectionné automatiquement.`);
          } else {
            setRegisterSuccess('Compte créé. Renseignez maintenant l\'ID client manuellement.');
          }
          setRegisterEmail('');
          setRegisterPassword('');
          setShowRegister(false);
        },
        onError: (err) => setRegisterError(err.message),
      }
    );
  }

  const selectedClient = knownClients.find((c) => String(c.id) === userId);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push('/dashboard/admin')}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            ← Retour
          </button>
          <h2 className="text-xl font-semibold text-gray-900">Nouveau projet</h2>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nom du projet
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex : Refonte site vitrine"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nom du client
              </label>
              <input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="Ex : Acme Corp"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Compte client
              </label>

              <div className="flex items-center gap-2">
                <select
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">— Sélectionner un client —</option>
                  {knownClients.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      #{c.id} — {c.email}
                    </option>
                  ))}
                </select>

                {/* Saisie manuelle si client introuvable dans la liste */}
                {userId && !selectedClient && (
                  <input
                    type="number"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="ID"
                    min="1"
                    className="w-24 shrink-0 px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>

              {/* ID saisi manuellement si pas dans la liste */}
              {!userId && (
                <input
                  type="number"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Ou saisir un ID manuellement"
                  min="1"
                  className="mt-2 w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}

              {registerSuccess && (
                <p className="text-green-600 text-xs mt-1.5">{registerSuccess}</p>
              )}

              {/* Lien création de fiche */}
              {!showRegister && (
                <button
                  type="button"
                  onClick={() => setShowRegister(true)}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-700 hover:underline hover:cursor-pointer"
                >
                  Le client n'a pas de compte ? Cliquez pour le créer.
                </button>
              )}
            </div>

            {/* Mini-formulaire création de compte */}
            {showRegister && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">Créer un compte client</p>
                  <button
                    type="button"
                    onClick={() => { setShowRegister(false); setRegisterError(''); }}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Annuler
                  </button>
                </div>
                <input
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="Email du client"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
                <input
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="Mot de passe temporaire"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
                {registerError && <p className="text-red-600 text-xs">{registerError}</p>}
                <button
                  type="button"
                  onClick={handleRegisterClient}
                  disabled={registerClient.isPending}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {registerClient.isPending ? 'Création...' : 'Créer le compte'}
                </button>
              </div>
            )}

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={createProject.isPending}
              className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {createProject.isPending ? 'Création...' : 'Créer le projet'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
