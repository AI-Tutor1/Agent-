const API_BASE = '/api';

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// Auth
export const api = {
  auth: {
    getUsers: () => fetchApi<any[]>('/auth/users'),
    login: (userId: string) =>
      fetchApi<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ userId }),
      }),
  },
  teachers: {
    getAll: () => fetchApi<any[]>('/teachers'),
    getSubjects: () => fetchApi<string[]>('/teachers/subjects'),
    getAcademicLevels: () => fetchApi<string[]>('/teachers/academic-levels'),
    getCurriculumBoards: () => fetchApi<string[]>('/teachers/curriculum-boards'),
    getRateTiers: () => fetchApi<string[]>('/teachers/rate-tiers'),
    getCurriculumHints: () => fetchApi<Record<string, Record<string, string>>>('/teachers/curriculum-hints'),
  },
  demos: {
    getPending: () => fetchApi<any[]>('/demos/pending'),
    getSubmissions: () => fetchApi<any[]>('/demos/submissions'),
    getLostReasons: () => fetchApi<string[]>('/demos/lost-reasons'),
    getFollowUpOptions: () => fetchApi<string[]>('/demos/follow-up-options'),
  },
  analyses: {
    getAll: () => fetchApi<any[]>('/analyses'),
    getById: (id: string) => fetchApi<any>(`/analyses/${id}`),
  },
  departments: {
    getAll: () => fetchApi<any[]>('/departments'),
    getById: (id: string) => fetchApi<any>(`/departments/${id}`),
  },
  tests: {
    getAll: () => fetchApi<any[]>('/tests'),
    getById: (id: string) => fetchApi<any>(`/tests/${id}`),
  },
};
