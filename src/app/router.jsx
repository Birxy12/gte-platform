import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

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
import ManageMails from "../pages/dashboard/admin/ManageMails";
import CreateQuiz from "../pages/dashboard/admin/CreateQuiz";
import ManageEconomy from "../pages/dashboard/admin/ManageEconomy";

import StudentDashboard from "../pages/dashboard/student/StudentDashboard";
import EnrolledCourses from "../pages/dashboard/student/EnrolledCourses";
import UserDashboard from "../pages/dashboard/user/UserDashboard";
import EditProfile from "../pages/dashboard/user/EditProfile";
import UserBlogPost from "../pages/dashboard/user/UserBlogPost";
import MyPosts from "../pages/dashboard/user/MyPosts";
import Inbox from "../pages/dashboard/user/Inbox";
import CodeEditorTab from "../pages/dashboard/user/CodeEditorTab";

import InstructorDashboard from "../pages/dashboard/instructor/InstructorDashboard";
import MyCourses from "../pages/dashboard/instructor/MyCourses";

import Blog from "../pages/blog/Blog";
import BlogDetails from "../pages/blog/BlogDetails";
import CreateBlogPost from "../pages/blog/CreatePost";

import Courses from "../pages/courses/Courses";
import CourseDetails from "../pages/courses/CourseDetails";
import LessonView from "../pages/courses/LessonView";
import Quiz from "../pages/courses/Quiz";

import ChatPage from "../pages/chat/ChatPage";
import DiscoverUsers from "../pages/social/DiscoverUsers";
import Reels from "../pages/social/Reels";
import Leaderboard from "../pages/social/Leaderboard";
import PublicProfile from "../pages/social/PublicProfile";
import CreateReel from "../pages/social/CreateReel";

import ProtectedRoute from "../components/common/ProtectedRoute";
import AdminRoute from "../routes/AdminRoute";
import InstructorRoute from "../routes/InstructorRoute";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import AiChatBot from "../components/bot/AiChatBot";

function RootRedirect() {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/home" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function Router() {
  return (
    <BrowserRouter>
      {/* Global Layout */}
      <Navbar />

      <Routes>
        {/* Smart root routing */}
        <Route path="/" element={<RootRedirect />} />

        {/* Authentication */}
        <Route path="/login" element={<LoginAccount />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Public Marketing & Info */}
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />

        {/* Blog Ecosystem */}
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogDetails />} />
        <Route path="/blog/create" element={
          <ProtectedRoute>
            <CreateBlogPost />
          </ProtectedRoute>
        } />

        {/* Course & Learning Matrix */}
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:courseId" element={<CourseDetails />} />
        <Route path="/courses/:courseId/lessons" element={
          <ProtectedRoute>
            <LessonView />
          </ProtectedRoute>
        } />
        <Route path="/courses/:courseId/lessons/:lessonId" element={
          <ProtectedRoute>
            <LessonView />
          </ProtectedRoute>
        } />
        <Route path="/quiz/:quizId" element={
          <ProtectedRoute>
            <Quiz />
          </ProtectedRoute>
        } />

        {/* Dedicated Student Command Center */}
        <Route path="/student" element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        } />

        {/* User Dashboard (nested routes) */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }>
          <Route path="profile" element={<EditProfile />} />
          <Route path="create-post" element={<UserBlogPost />} />
          <Route path="my-posts" element={<MyPosts />} />
          <Route path="enrolled" element={<EnrolledCourses />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="editor" element={<CodeEditorTab />} />
        </Route>

        {/* Real-time Comms & Social Hub */}
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

        <Route path="/reels" element={
          <ProtectedRoute>
            <Reels />
          </ProtectedRoute>
        } />
        
        <Route path="/reels/create" element={
          <ProtectedRoute>
            <CreateReel />
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
          <Route path="mails" element={<ManageMails />} />
          <Route path="economy" element={<ManageEconomy />} />
          <Route path="create-quiz" element={<CreateQuiz />} />
        </Route>

        {/* Protected Instructor Routes */}
        <Route path="/instructor" element={
          <InstructorRoute>
            <InstructorDashboard />
          </InstructorRoute>
        } />
        <Route path="/instructor/courses" element={
          <InstructorRoute>
            <MyCourses />
          </InstructorRoute>
        } />

        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>

      <Footer />
      <AiChatBot />
    </BrowserRouter>
  );
}