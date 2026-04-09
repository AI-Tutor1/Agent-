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
