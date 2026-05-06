import { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'

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
  
  if (!token || !user) return <Navigate to="/login" replace />
  if (user.role === 'admin') return <Navigate to="/admin" replace />
  
  return children
}

function App() {
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
