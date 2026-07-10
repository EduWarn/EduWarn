import React, { Suspense, lazy } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FeatureSection from '../components/FeatureSection';
import SEO from '../components/SEO';

const CourseSection = lazy(() => import('../components/CourseSection'));
const ProgramsShowcase = lazy(() => import('../components/ProgramsShowcase'));
const YouTubeShowcase = lazy(() => import('../components/YouTubeShowcase'));
const TestimonialSection = lazy(() => import('../components/TestimonialSection'));
const CallToAction = lazy(() => import('../components/CallToAction'));
const PartnerSection = lazy(() => import('../components/PartnerSection'));
const Footer = lazy(() => import('../components/Footer'));

const SectionFallback = () => (
  <div className="h-64 w-full animate-pulse bg-muted/30" aria-hidden="true" />
);

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEO
        title="EduWarn Nepal — Home Tuition & Online Courses in Nepal"
        description="Nepal's trusted home tuition and online learning platform. Expert tutors for SEE, Grade 11–12, IELTS, and LokSewa."
        path="/"
      />
      <Navbar />
      <main>
        <Hero />
        <FeatureSection />
        <Suspense fallback={<SectionFallback />}>
          <CourseSection />
          <ProgramsShowcase />
          <YouTubeShowcase />
          <TestimonialSection />
          <CallToAction />
        </Suspense>
      </main>
      <Suspense fallback={<SectionFallback />}>
        <PartnerSection />
        <Footer />
      </Suspense>
    </div>
  );
};

export default Index;

