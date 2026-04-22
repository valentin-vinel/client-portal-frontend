import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PaginatedResponse, Project } from '@/types';

export function useProjects(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['projects', page, limit],
    queryFn: () => api.get<PaginatedResponse<Project>>(`/projects?page=${page}&limit=${limit}`),
  });
}