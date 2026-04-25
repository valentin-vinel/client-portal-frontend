export interface User {
  id: number;
  email: string;
  role: 'admin' | 'client';
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
}

export interface Step {
  id: number;
  title: string;
  description?: string;
  status: string;
  order: number;
  projectId: number;
}

export interface Report {
  id: number;
  title: string;
  content: string;
  projectId: number;
  createdAt: string;
}

export interface Document {
  id: number;
  name: string;
  url: string;
  type: string;
  projectId: number;
  createdAt: string;
}

export interface Project {
  id: number;
  name: string;
  client: string;
  status: string;
  userId: number;
  user?: User;
  steps?: Step[];
  reports?: Report[];
  documents?: Document[];
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  access_token: string;
}