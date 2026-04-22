# Contexte du projet — Client Portal Frontend

## Vue d'ensemble
Tu travailles sur le frontend d'un portail client permettant le suivi de projet en temps réel pour des freelances. Les clients se connectent et accèdent aux étapes, documents et comptes rendus de leur projet. Les admins gèrent tout depuis une interface dédiée.

## Stack technique
- Next.js 15 avec App Router
- TypeScript
- Tailwind CSS
- TanStack Query pour le fetching de données
- Contexte React pour l'authentification

## Backend
L'API NestJS tourne sur `http://localhost:3000`. Les variables d'environnement sont dans `.env.local` :
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Structure du projet
```
src/
├── app/
│   ├── login/page.tsx          ← Page de connexion
│   ├── dashboard/
│   │   ├── page.tsx            ← Liste des projets
│   │   └── projects/
│   │       └── [id]/page.tsx   ← Détail d'un projet
├── components/
│   └── navbar.tsx              ← Navigation réutilisable
├── contexts/
│   └── auth-context.tsx        ← Contexte auth (user, login, logout)
├── hooks/
│   ├── use-projects.ts         ← Hook TanStack Query pour la liste des projets
│   └── use-project.ts          ← Hook TanStack Query pour un projet
├── lib/
│   └── api.ts                  ← Client API (get, post, patch, delete)
├── providers/
│   └── query-provider.tsx      ← Provider TanStack Query
├── types/
│   └── index.ts                ← Types TypeScript (User, Project, Step, Report, Document)
└── middleware.ts                ← Protection des routes (redirige vers /login si pas de token)
```

## Types disponibles
```typescript
User { id, email, role: 'admin' | 'client' }
Project { id, name, client, status, userId, user?, steps?, reports?, documents?, createdAt }
Step { id, title, description?, status, order, projectId }
Report { id, title, content, projectId, createdAt }
Document { id, name, url, type, projectId, createdAt }
PaginatedResponse<T> { data: T[], meta: { total, page, limit, totalPages } }
```

## Client API
```typescript
import { api } from '@/lib/api';

api.get<T>(endpoint)
api.post<T>(endpoint, body)
api.patch<T>(endpoint, body)
api.delete<T>(endpoint)
```
Le token JWT est automatiquement ajouté aux headers depuis le localStorage.

## Authentification
```typescript
import { useAuth } from '@/contexts/auth-context';
const { user, login, logout, isLoading } = useAuth();
// user.role === 'admin' | 'client'
```

## Conventions de code
- Tous les composants de page sont des Client Components (`'use client'`)
- TanStack Query pour tous les appels API
- Tailwind CSS uniquement pour le styling — pas de CSS custom
- Redirection vers `/login` si l'utilisateur n'est pas connecté
- Le composant `<Navbar />` est utilisé sur toutes les pages authentifiées

## Design system
Couleurs et styles utilisés de manière cohérente :
- Fond de page : `bg-gray-50`
- Cards : `bg-white rounded-xl border border-gray-100 p-5`
- Titres : `text-gray-900 font-semibold`
- Textes secondaires : `text-gray-500 text-sm`
- Bouton primaire : `bg-blue-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-blue-700`
- Bouton danger : `bg-red-50 text-red-600 py-2 px-3 rounded-lg text-sm hover:bg-red-100`
- Badge succès : `bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium`
- Badge en cours : `bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium`
- Badge pending : `bg-gray-50 text-gray-500 text-xs px-2.5 py-1 rounded-full font-medium`
- Input : `w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`

## Ce qui reste à construire
La partie admin du portail. Un utilisateur avec le rôle `admin` doit pouvoir :

### Pages à créer
- `/dashboard/admin` — tableau de bord admin avec liste de tous les projets et bouton "Nouveau projet"
- `/dashboard/admin/projects/new` — formulaire de création d'un projet (name, client, userId)
- `/dashboard/admin/projects/[id]/edit` — modification d'un projet + gestion des étapes, comptes rendus, documents

### Endpoints API disponibles côté backend

**Projets**
- `GET /projects` — liste paginée
- `POST /projects` — créer `{ name, client, userId }`
- `PATCH /projects/:id` — modifier `{ name?, client?, status? }`
- `DELETE /projects/:id` — supprimer

**Étapes**
- `GET /projects/:projectId/steps` — liste paginée
- `POST /projects/:projectId/steps` — créer `{ title, description?, status?, order, projectId }`
- `PATCH /projects/:projectId/steps/:id` — modifier `{ title?, description?, status?, order? }`
- `DELETE /projects/:projectId/steps/:id` — supprimer

**Comptes rendus**
- `GET /projects/:projectId/reports` — liste paginée
- `POST /projects/:projectId/reports` — créer `{ title, content, projectId }`
- `PATCH /projects/:projectId/reports/:id` — modifier `{ title?, content? }`
- `DELETE /projects/:projectId/reports/:id` — supprimer

**Documents**
- `GET /projects/:projectId/documents` — liste paginée
- `POST /projects/:projectId/documents` — créer `{ name, url, type, projectId }`
- `PATCH /projects/:projectId/documents/:id` — modifier `{ name?, url?, type? }`
- `DELETE /projects/:projectId/documents/:id` — supprimer

**Users (pour assigner un projet à un client)**
- `POST /auth/register` — créer un compte client `{ email, password }`

### Règles importantes
- Vérifier que `user.role === 'admin'` avant d'afficher les actions admin
- Utiliser `useMutation` de TanStack Query pour les POST/PATCH/DELETE
- Invalider le cache TanStack Query après chaque mutation avec `queryClient.invalidateQueries`
- Suivre exactement le même design system que les pages existantes
- Pas de librairie de composants externe — Tailwind pur uniquement