import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UserLayout from '../components/user/UserLayout';
import UserHome from './user/UserHome';
import UserLessons from './user/UserLessons';
import UserExams from './user/UserExams';
import UserExamSolve from './user/UserExamSolve';
import UserStats from './user/UserStats';
import UserSupport from './user/UserSupport';

const UserDashboard = () => {
  return (
    <Routes>
      {/* Exam Solve has its own full-screen layout (no outer padding) */}
      <Route path="exams/:examId" element={<UserLayout fullscreen />}>
        <Route index element={<UserExamSolve />} />
      </Route>
      <Route path="exams/short-test/:categoryId" element={<UserLayout fullscreen />}>
        <Route index element={<UserExamSolve customType="short_test" />} />
      </Route>

      {/* Standard layout for all other pages */}
      <Route element={<UserLayout />}>
        <Route index element={<UserHome />} />
        <Route path="lessons" element={<UserLessons />} />
        <Route path="exams" element={<UserExams />} />
        <Route path="stats" element={<UserStats />} />
        <Route path="support" element={<UserSupport />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default UserDashboard;
