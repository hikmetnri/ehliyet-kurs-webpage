import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UserLayout from '../components/user/UserLayout';
import UserHome from './user/UserHome';
import UserLessons from './user/UserLessons';
import UserExams from './user/UserExams';
import UserExamSolve from './user/UserExamSolve';
import UserStats from './user/UserStats';
import UserSupport from './user/UserSupport';
import UserFeed from './user/UserFeed';
import UserSettings from './user/UserSettings';
import UserFavorites from './user/UserFavorites';
import UserTrafficSigns from './user/UserTrafficSigns';
import CategorySelectorModal from '../components/user/CategorySelectorModal';
import useAuthStore from '../store/authStore';

const UserDashboard = () => {
  const { user } = useAuthStore();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // İlk giriş onboarding: kategori seçilmemişse otomatik aç
  useEffect(() => {
    if (user && !user.selectedCategoryId) {
      // 400ms gecikme ile aç — layout animasyonunun tamamlanmasını bekle
      const timer = setTimeout(() => setShowOnboarding(true), 400);
      return () => clearTimeout(timer);
    }
  }, [user?.selectedCategoryId]);

  return (
    <>
      <Routes>
        {/* Exam Solve has its own full-screen layout (no outer padding) */}
        <Route path="exams/:examId" element={<UserLayout fullscreen />}>
          <Route index element={<UserExamSolve />} />
        </Route>
        <Route path="exams/short-test/:categoryId" element={<UserLayout fullscreen />}>
          <Route index element={<UserExamSolve customType="short_test" />} />
        </Route>
        <Route path="exams/real-test/:categoryId" element={<UserLayout fullscreen />}>
          <Route index element={<UserExamSolve customType="real_test" />} />
        </Route>

        {/* Standard layout for all other pages */}
        <Route element={<UserLayout />}>
          <Route index element={<UserHome />} />
          <Route path="lessons" element={<UserLessons />} />
          <Route path="exams" element={<UserExams />} />
          <Route path="stats" element={<UserStats />} />
          <Route path="feed" element={<UserFeed />} />
          <Route path="support" element={<UserSupport />} />
          <Route path="settings" element={<UserSettings />} />
          <Route path="favorites" element={<UserFavorites />} />
          <Route path="traffic-signs" element={<UserTrafficSigns />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>

      {/* Onboarding Modal — ilk girişte otomatik açılır */}
      <CategorySelectorModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </>
  );
};

export default UserDashboard;
