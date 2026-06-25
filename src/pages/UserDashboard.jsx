import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UserLayout from '../components/user/UserLayout';
import UserHome from './user/UserHome';
import UserLessons from './user/UserLessons';
import UserExams from './user/UserExams';
import UserExamSolve from './user/UserExamSolve';
import UserStats from './user/UserStats';
import UserSupport from './user/UserSupport';
import UserFeed from './user/UserFeed';
import UserFeedDetail from './user/UserFeedDetail';
import UserSettings from './user/UserSettings';
import UserFavorites from './user/UserFavorites';
import UserTrafficSigns from './user/UserTrafficSigns';
import UserDrivingSchools from './user/UserDrivingSchools';
import UserDrivingSchoolApply from './user/UserDrivingSchoolApply';
import UserVideos from './user/UserVideos';
import UserAIChat from './user/UserAIChat';
import useAuthStore from '../store/authStore';
import GuestBlocker from '../components/user/GuestBlocker';

const GuestGate = ({ children, title, description }) => {
  const user = useAuthStore((state) => state.user);
  if (user?.isGuest) {
    return <GuestBlocker title={title} description={description} />;
  }
  return children;
};

const UserDashboard = () => {
  return (
    <Routes>
      {/* Exam Solve has its own full-screen layout (no outer padding) */}
      <Route path="exams/wrong-review" element={<UserLayout fullscreen />}>
        <Route index element={<UserExamSolve customType="wrong_review" />} />
      </Route>
      <Route path="exams/wrong-answers" element={<UserLayout fullscreen />}>
        <Route index element={<UserExamSolve customType="wrong_answers" />} />
      </Route>
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
        
        <Route 
          path="stats" 
          element={
            <GuestGate title="İstatistiklerinizi Görün" description="Çözdüğünüz sınavların analizlerini, başarı oranınızı ve gelişim grafiklerinizi takip etmek için üye olun.">
              <UserStats />
            </GuestGate>
          } 
        />
        <Route 
          path="feed" 
          element={
            <GuestGate title="Sürücü Akışına Katılın" description="Diğer sürücü adaylarıyla yardımlaşmak, soru paylaşmak ve güncel haberleri takip etmek için üye olun.">
              <UserFeed />
            </GuestGate>
          } 
        />
        <Route 
          path="feed/:postId" 
          element={
            <GuestGate title="Sürücü Akışına Katılın" description="Gönderileri ve yapılan yorumları incelemek için lütfen giriş yapın.">
              <UserFeedDetail />
            </GuestGate>
          } 
        />
        <Route path="support" element={<UserSupport />} />
        <Route 
          path="settings" 
          element={
            <GuestGate title="Profilinizi Yönetin" description="Kişisel bilgilerinizi, uygulama temasını ve push bildirim ayarlarını değiştirmek için üye olun.">
              <UserSettings />
            </GuestGate>
          } 
        />
        <Route 
          path="favorites" 
          element={
            <GuestGate title="Favori Sorularım" description="Zorlandığınız veya daha sonra tekrar çözmek istediğiniz soruları favorilerinize eklemek için üye olun.">
              <UserFavorites />
            </GuestGate>
          } 
        />
        
        <Route path="traffic-signs" element={<UserTrafficSigns />} />
        <Route path="videos" element={<UserVideos />} />
        <Route path="driving-schools" element={<UserDrivingSchools />} />
        <Route path="driving-schools/:id/apply" element={<UserDrivingSchoolApply />} />
        <Route path="ai-chat" element={<UserAIChat />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default UserDashboard;
