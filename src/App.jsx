import { Suspense, lazy, useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'
import api from './api'
import MaintenanceScreen from './components/MaintenanceScreen'
import {
  registerWebPushToken,
  startWebPushForegroundListener,
} from './services/webPushService'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const AccountDeletion = lazy(() => import('./pages/AccountDeletion'))
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminExams = lazy(() => import('./pages/admin/AdminExams'))
const AdminContent = lazy(() => import('./pages/admin/AdminContent'))
const AdminStats = lazy(() => import('./pages/admin/AdminStats'))
const AdminSupport = lazy(() => import('./pages/admin/AdminSupport'))
const AdminFeed = lazy(() => import('./pages/admin/AdminFeed'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))
const AdminReports = lazy(() => import('./pages/admin/AdminReports'))
const AdminBadges = lazy(() => import('./pages/admin/AdminBadges'))
const AdminMarketing = lazy(() => import('./pages/admin/AdminMarketing'))
const AdminDrivingSchools = lazy(() => import('./pages/admin/AdminDrivingSchools'))
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile'))
const UserDashboard = lazy(() => import('./pages/UserDashboard'))

const RouteFallback = () => (
  <div className="min-h-screen bg-[#050508]" aria-label="Sayfa yükleniyor" />
)

// Protected Route for Admin
const AdminRoute = ({ children }) => {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  
  if (!token || !user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />
  
  return children
}

// Protected Route for Users
const UserRoute = ({ children }) => {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const logout = useAuthStore((state) => state.logout)
  const startGuestMode = useAuthStore((state) => state.startGuestMode)
  const shouldCheckMaintenance = Boolean(token && user && user.role !== 'admin')
  const maintenanceKey = shouldCheckMaintenance ? `${token}:${user.role}` : 'skip'
  const [maintenanceStatus, setMaintenanceStatus] = useState({
    key: 'init',
    maintenance: false,
  })

  useEffect(() => {
    if (!token || !user) {
      startGuestMode()
    }
  }, [token, user, startGuestMode])

  useEffect(() => {
    if (!shouldCheckMaintenance) return undefined

    let active = true

    api.get('/status')
      .then((res) => {
        if (active) {
          setMaintenanceStatus({
            key: maintenanceKey,
            maintenance: Boolean(res.data?.maintenance),
          })
        }
      })
      .catch(() => {
        if (active) {
          setMaintenanceStatus({
            key: maintenanceKey,
            maintenance: false,
          })
        }
      })

    return () => { active = false }
  }, [maintenanceKey, shouldCheckMaintenance])

  const checkingMaintenance = shouldCheckMaintenance && maintenanceStatus.key !== maintenanceKey
  const maintenance = shouldCheckMaintenance && maintenanceStatus.key === maintenanceKey && maintenanceStatus.maintenance
  
  if (!token || !user) return <RouteFallback />
  if (user.role === 'admin') return <Navigate to="/admin" replace />
  if (checkingMaintenance) return <RouteFallback />
  if (maintenance) {
    return (
      <MaintenanceScreen
        onLogout={() => {
          logout()
          window.location.href = '/login'
        }}
      />
    )
  }
  
  return children
}

function App() {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)

  useEffect(() => {
    startWebPushForegroundListener()
  }, [])

  useEffect(() => {
    if (!user || !token) return
    if (typeof window === 'undefined' || !('Notification' in window)) return
    if (Notification.permission !== 'granted') return

    registerWebPushToken().catch((error) => {
      console.info('Web push yeniden kaydedilemedi:', error?.message || error)
    })
  }, [token, user])

  return (
    <Router>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/policy" element={<PrivacyPolicy />} />
          <Route path="/delete-account" element={<AccountDeletion />} />
          <Route path="/settings" element={<Navigate to="/dashboard/settings" replace />} />
          <Route path="/privacy" element={<Navigate to="/policy" replace />} />
          <Route path="/privacy-policy" element={<Navigate to="/policy" replace />} />
          <Route path="/hesap-silme" element={<Navigate to="/delete-account" replace />} />
          <Route path="/gizlilik-politikasi" element={<Navigate to="/policy" replace />} />
          
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            {/* Default admin page */}
            <Route index element={<AdminDashboard />} />
            
            <Route path="users" element={<AdminUsers />} />
            <Route path="exams" element={<AdminExams />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="stats" element={<AdminStats />} />
            <Route path="support" element={<AdminSupport />} />
            <Route path="feed" element={<AdminFeed />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="badges" element={<AdminBadges />} />
            <Route path="marketing" element={<AdminMarketing />} />
            <Route path="driving-schools" element={<AdminDrivingSchools />} />
            <Route path="profile" element={<AdminProfile />} />
            
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          
          {/* User Routes */}
          <Route 
            path="/dashboard/*" 
            element={
              <UserRoute>
                <UserDashboard />
              </UserRoute>
            } 
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
