import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import PrivacyPolicy from './pages/PrivacyPolicy'
import AccountDeletion from './pages/AccountDeletion'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminExams from './pages/admin/AdminExams'
import AdminContent from './pages/admin/AdminContent'
import AdminStats from './pages/admin/AdminStats'
import AdminSupport from './pages/admin/AdminSupport'
import AdminFeed from './pages/admin/AdminFeed'
import AdminSettings from './pages/admin/AdminSettings'
import AdminReports from './pages/admin/AdminReports'
import AdminBadges from './pages/admin/AdminBadges'
import UserDashboard from './pages/UserDashboard'
import useAuthStore from './store/authStore'

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
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/policy" element={<PrivacyPolicy />} />
        <Route path="/delete-account" element={<AccountDeletion />} />
        <Route path="/settings" element={<Navigate to="/delete-account" replace />} />
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
    </Router>
  )
}

export default App
