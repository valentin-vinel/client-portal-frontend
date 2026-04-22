import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Project, Step, Report, Document } from '@/types';

// --- Projets ---

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; client: string; userId: number }) =>
      api.post<Project>('/projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name?: string; client?: string; status?: string }) =>
      api.patch<Project>(`/projects/${projectId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: number) => api.delete(`/projects/${projectId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// --- Étapes ---

export function useCreateStep(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; description?: string; status?: string; order: number }) =>
      api.post<Step>(`/projects/${projectId}/steps`, { ...data, projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
}

export function useUpdateStep(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ stepId, data }: { stepId: number; data: { title?: string; description?: string; status?: string; order?: number } }) =>
      api.patch<Step>(`/projects/${projectId}/steps/${stepId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
}

export function useDeleteStep(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (stepId: number) => api.delete(`/projects/${projectId}/steps/${stepId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
}

// --- Comptes rendus ---

export function useCreateReport(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; content: string }) =>
      api.post<Report>(`/projects/${projectId}/reports`, { ...data, projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
}

export function useUpdateReport(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reportId, data }: { reportId: number; data: { title?: string; content?: string } }) =>
      api.patch<Report>(`/projects/${projectId}/reports/${reportId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
}

export function useDeleteReport(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reportId: number) => api.delete(`/projects/${projectId}/reports/${reportId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
}

// --- Documents ---

export function useCreateDocument(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; url: string; type: string }) =>
      api.post<Document>(`/projects/${projectId}/documents`, { ...data, projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
}

export function useUpdateDocument(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ documentId, data }: { documentId: number; data: { name?: string; url?: string; type?: string } }) =>
      api.patch<Document>(`/projects/${projectId}/documents/${documentId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
}

export function useDeleteDocument(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: number) => api.delete(`/projects/${projectId}/documents/${documentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
}
