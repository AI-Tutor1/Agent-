import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'counselor' | 'sales' | 'manager' | 'dual' | 'admin'

export interface User {
  id: string
  name: string
  role: UserRole
  dept: string
}

interface AuthStore {
  user: User | null
  viewMode: 'counselor' | 'manager'
  setUser: (user: User) => void
  clearUser: () => void
  setViewMode: (mode: 'counselor' | 'manager') => void
}

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Wajeeha Gul',        role: 'counselor', dept: 'Product / Counseling' },
  { id: 'u2', name: 'Hoor ul Ain Khatri', role: 'sales',     dept: 'Sales' },
  { id: 'u3', name: 'Maryam Rasheeed',    role: 'sales',     dept: 'Sales' },
  { id: 'u4', name: 'Dawood Larejani',    role: 'dual',      dept: 'Product / Counseling' },
]

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      viewMode: 'counselor',
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      setViewMode: (mode) => set({ viewMode: mode }),
    }),
    { name: 'tuitional-auth' }
  )
)
