import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/landing/Home";
import About from "../pages/landing/About";
import Contact from "../pages/landing/Contact";
import LoginAccount from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";

import AdminDashboard from "../pages/dashboard/admin/AdminDashboard";
import CreatePost from "../pages/dashboard/admin/CreatePost";
import CreateCourse from "../pages/dashboard/admin/CreateCourse";
import ManageUsers from "../pages/dashboard/admin/ManageUsers";
import ManageCourses from "../pages/dashboard/admin/ManageCourses";
import ManagePosts from "../pages/dashboard/admin/ManagePosts";
import EditCourse from "../pages/dashboard/admin/EditCourse";
import AdminSettings from "../pages/dashboard/admin/AdminSettings";
import ManageReports from "../pages/dashboard/admin/ManageReports";

import UserDashboard from "../pages/dashboard/user/UserDashboard";
import EditProfile from "../pages/dashboard/user/EditProfile";
import UserBlogPost from "../pages/dashboard/user/UserBlogPost";
import MyPosts from "../pages/dashboard/user/MyPosts";
import ProgressPage from "../pages/dashboard/user/ProgressPage";  // Added Progress Page
import QuizPage from "../pages/dashboard/user/QuizPage";  // Added Quiz Page
import CertificatePage from "../pages/dashboard/user/CertificatePage";  // Added Certificate Page

import Blog from "../pages/blog/Blog";
import Courses from "../pages/courses/Courses";
import ChatPage from "../pages/chat/ChatPage";
import DiscoverUsers from "../pages/social/DiscoverUsers";

import ProtectedRoute from "../components/common/ProtectedRoute";
import AdminRoute from "../routes/AdminRoute";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

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
        <Route path="/blog" element={<Blog />} />
        <Route path="/courses" element={<Courses />} />

        {/* User Dashboard (nested routes) */}
        <Route path="/dashboard" element={<UserDashboard />}>
          <Route path="profile" element={<EditProfile />} />
          <Route path="create-post" element={<UserBlogPost />} />
          <Route path="my-posts" element={<MyPosts />} />
          <Route path="progress" element={<ProgressPage />} /> {/* Progress Page */}
          <Route path="quiz" element={<QuizPage />} /> {/* Quiz Page */}
          <Route path="certificate" element={<CertificatePage />} /> {/* Certificate Page */}
        </Route>

        <Route path="/chat" element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        } />

        <Route path="/discover" element={
          <ProtectedRoute>
            <DiscoverUsers />
          </ProtectedRoute>
        } />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }>
          <Route path="users" element={<ManageUsers />} />
          <Route path="manage-courses" element={<ManageCourses />} />
          <Route path="manage-posts" element={<ManagePosts />} />
          <Route path="edit-course/:id" element={<EditCourse />} />
          <Route path="create-post" element={<CreatePost />} />
          <Route path="create-course" element={<CreateCourse />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="reports" element={<ManageReports />} />
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>

      <Footer />
    </BrowserRouter>
  );
}
