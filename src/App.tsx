import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Index from './pages/index'
import LoginPage from './pages/login'
import CounselorPage from './pages/counselor/index'
import SalesPage from './pages/sales/index'
import ManagerPage from './pages/manager/index'
import { ShadowModeBanner } from './components/ShadowModeBanner'
import { ToastContainer } from './components/Toast'

export default function App() {
  return (
    <BrowserRouter>
      <ShadowModeBanner />
      <ToastContainer />
      <div style={{ paddingTop: 32 }}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/counselor" element={<CounselorPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/manager/*" element={<ManagerPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
