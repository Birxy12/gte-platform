import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/landing/Home";
import About from "../pages/landing/About";
import Contact from "../pages/landing/Contact";
import Pricing from "../pages/landing/Pricing";
import LoginAccount from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import TermsOfService from "../pages/TermsOfService";

import AdminDashboard from "../pages/dashboard/admin/AdminDashboard";
import CreatePost from "../pages/dashboard/admin/CreatePost";
import CreateCourse from "../pages/dashboard/admin/CreateCourse";
import ManageUsers from "../pages/dashboard/admin/ManageUsers";
import ManageCourses from "../pages/dashboard/admin/ManageCourses";
import ManagePosts from "../pages/dashboard/admin/ManagePosts";
import EditCourse from "../pages/dashboard/admin/EditCourse";
import AdminSettings from "../pages/dashboard/admin/AdminSettings";
import ManageReports from "../pages/dashboard/admin/ManageReports";
import ManageTestimonies from "../pages/dashboard/admin/ManageTestimonies";
import ManageReels from "../pages/dashboard/admin/ManageReels";
import ManageTasks from "../pages/dashboard/admin/ManageTasks";
import ManageQuizzes from "../pages/dashboard/admin/ManageQuizzes";
import ManageCertificates from "../pages/dashboard/admin/ManageCertificates";
import ManageLeadership from "../pages/dashboard/admin/ManageLeadership";
import ManageInstructors from "../pages/dashboard/admin/ManageInstructors";
import CreateQuiz from "../pages/dashboard/admin/CreateQuiz";

import EnrolledCourses from "../pages/dashboard/student/EnrolledCourses";
import UserDashboard from "../pages/dashboard/user/UserDashboard";
import EditProfile from "../pages/dashboard/user/EditProfile";
import UserBlogPost from "../pages/dashboard/user/UserBlogPost";
import MyPosts from "../pages/dashboard/user/MyPosts";

import InstructorDashboard from "../pages/dashboard/instructor/InstructorDashboard";

import Blog from "../pages/blog/Blog";
import Courses from "../pages/courses/Courses";
import ChatPage from "../pages/chat/ChatPage";
import DiscoverUsers from "../pages/social/DiscoverUsers";
import Reels from "../pages/social/Reels";
import Leaderboard from "../pages/social/Leaderboard";
import PublicProfile from "../pages/social/PublicProfile";

import ProtectedRoute from "../components/common/ProtectedRoute";
import AdminRoute from "../routes/AdminRoute";
import InstructorRoute from "../routes/InstructorRoute";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import AiChatBot from "../components/bot/AiChatBot";


export default function Router() {
  return (
    <BrowserRouter>

      {/* Global Layout */}
      <Navbar />

      <Routes>

        {/* Redirect root */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Authentication */}
        <Route path="/login" element={<LoginAccount />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Public pages */}
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />

        {/* User Dashboard (nested routes) */}
        <Route path="/dashboard" element={<UserDashboard />}>
          <Route path="profile" element={<EditProfile />} />
          <Route path="create-post" element={<UserBlogPost />} />
          <Route path="my-posts" element={<MyPosts />} />
          <Route path="enrolled" element={<EnrolledCourses />} />
        </Route>

        <Route path="/chat" element={<ChatPage />} />

        <Route path="/discover" element={
          <ProtectedRoute>
            <DiscoverUsers />
          </ProtectedRoute>
        } />

        <Route path="/reels" element={
          <ProtectedRoute>
            <Reels />
          </ProtectedRoute>
        } />

        <Route path="/leaderboard" element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        } />

        <Route path="/profile/:uid" element={
          <ProtectedRoute>
            <PublicProfile />
          </ProtectedRoute>
        } />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }>
          <Route path="users" element={<ManageUsers />} />
          <Route path="instructors" element={<ManageInstructors />} />
          <Route path="manage-courses" element={<ManageCourses />} />
          <Route path="manage-posts" element={<ManagePosts />} />
          <Route path="edit-course/:id" element={<EditCourse />} />
          <Route path="create-post" element={<CreatePost />} />
          <Route path="create-course" element={<CreateCourse />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="reports" element={<ManageReports />} />
          <Route path="testimonies" element={<ManageTestimonies />} />
          <Route path="manage-reels" element={<ManageReels />} />
          <Route path="manage-tasks" element={<ManageTasks />} />
          <Route path="manage-quizzes" element={<ManageQuizzes />} />
          <Route path="certificates" element={<ManageCertificates />} />
          <Route path="manage-leadership" element={<ManageLeadership />} />
          <Route path="create-quiz" element={<CreateQuiz />} />
        </Route>

        {/* Protected Instructor Routes */}
        <Route path="/instructor" element={
          <InstructorRoute>
            <InstructorDashboard />
          </InstructorRoute>
        } />


        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>

      <Footer />
      <AiChatBot />

    </BrowserRouter>
  );
}