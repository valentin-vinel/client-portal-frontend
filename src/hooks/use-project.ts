import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Project } from '@/types';

export function useProject(id: number) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => api.get<Project>(`/projects/${id}`),
    enabled: !!id,
  });
}