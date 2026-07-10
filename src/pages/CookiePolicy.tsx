import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Cookie Policy | EduWarn Nepal - Home Tuition Kathmandu</title>
        <meta name="description" content="Learn about how EduWarn Nepal uses cookies on our website for home tuition services in Kathmandu, Nepal." />
        <link rel="canonical" href="https://sajilotuition.com/cookie-policy" />
      </Helmet>
      <Navbar />
      
      <main className="flex-grow bg-background py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8">Cookie Policy</h1>
          
          <div className="bg-card rounded-lg shadow-md p-6 md:p-8 space-y-6 border">
            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Introduction</h2>
              <p className="text-muted-foreground">Last updated: February 27, 2026</p>
              <p className="text-muted-foreground mt-3">
                This Cookie Policy explains how EduWarn Nepal ("we," "our," or "us") uses cookies and similar technologies to recognize you when you visit our website at sajilotuition.com.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-primary mb-3">What are Cookies?</h2>
              <p className="text-muted-foreground">
                Cookies are small data files placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide reporting information.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Types of Cookies We Use</h2>
              <ul className="list-disc pl-6 mt-2 text-muted-foreground">
                <li><strong>Essential Cookies:</strong> Strictly necessary for core website functionality and user sessions.</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website.</li>
                <li><strong>Functionality Cookies:</strong> Remember your preferences and settings.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-primary mb-3">How to Control Cookies</h2>
              <p className="text-muted-foreground">
                You can control and manage cookies through your browser settings. Visit <a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">www.aboutcookies.org</a> for more information.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Contact Us</h2>
              <p className="text-muted-foreground mt-2">
                Email: team.eduwarn@gmail.com<br />
                Phone: +977 9816254775<br />
                Address: New Baneshwor, Kathmandu, Nepal
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CookiePolicy;
