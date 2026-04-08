import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'

export default function Index() {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" />
  if (user.role === 'counselor') return <Navigate to="/counselor" />
  if (user.role === 'sales') return <Navigate to="/sales" />
  return <Navigate to="/manager" />
}
