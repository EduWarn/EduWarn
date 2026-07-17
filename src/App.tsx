import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import ScrollToTop from './components/ScrollToTop';
import RouteFallback from './components/RouteFallback';
import ErrorBoundary from './components/ErrorBoundary';
import AdminLayout from './components/layouts/AdminLayout';
import Index from './pages/Index';

// Lazy-load every non-critical route to shrink initial bundle
const About = lazy(() => import('./pages/About'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Career = lazy(() => import('./pages/Career'));
const Profile = lazy(() => import('./pages/Profile'));
const Tutors = lazy(() => import('./pages/Tutors'));
const Courses = lazy(() => import('./pages/Courses'));
const Programs = lazy(() => import('./pages/Programs'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const Contact = lazy(() => import('./pages/Contact'));
const TutorApplication = lazy(() => import('./pages/TutorApplication'));
const PartnershipForm = lazy(() => import('./pages/PartnershipForm'));
const Donation = lazy(() => import('./pages/Donation'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AddAdmin = lazy(() => import('./pages/AddAdmin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminCourses = lazy(() => import('./pages/AdminCourses'));
const AdminBlog = lazy(() => import('./pages/AdminBlog'));
const AdminContacts = lazy(() => import('./pages/AdminContacts'));
const AdminInsights = lazy(() => import('./pages/AdminInsights'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminPrograms = lazy(() => import('./pages/AdminPrograms'));
const AdminPayments = lazy(() => import('./pages/AdminPayments'));
const AdminCourseContent = lazy(() => import('./pages/AdminCourseContent'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <ErrorBoundary>
              <div className="min-h-screen bg-background font-sans antialiased">
                <Toaster />
                <PWAInstallPrompt />
                <ScrollToTop />
                <Suspense fallback={<RouteFallback />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                    <Route path="/career" element={<Career />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/tutors" element={<Tutors />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/programs" element={<Programs />} />
                    <Route path="/course/:courseId" element={<CourseDetail />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/tutor-application" element={<TutorApplication />} />
                    <Route path="/partnership" element={<PartnershipForm />} />
                    <Route path="/donate" element={<Donation />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/cookies" element={<CookiePolicy />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route path="/admin/setup" element={<AddAdmin />} />
                    <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
                    <Route path="/admin/courses" element={<AdminLayout><AdminCourses /></AdminLayout>} />
                    <Route path="/admin/blog" element={<AdminLayout><AdminBlog /></AdminLayout>} />
                    <Route path="/admin/contacts" element={<AdminLayout><AdminContacts /></AdminLayout>} />
                    <Route path="/admin/insights" element={<AdminLayout><AdminInsights /></AdminLayout>} />
                    <Route path="/admin/users" element={<AdminLayout><AdminUsers /></AdminLayout>} />
                    <Route path="/admin/programs" element={<AdminLayout><AdminPrograms /></AdminLayout>} />
                    <Route path="/admin/payments" element={<AdminLayout><AdminPayments /></AdminLayout>} />
                    <Route path="/admin/courses/:courseId/content" element={<AdminLayout><AdminCourseContent /></AdminLayout>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </div>
            </ErrorBoundary>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
