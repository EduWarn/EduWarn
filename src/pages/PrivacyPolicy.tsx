import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Privacy Policy | EduWarn Nepal - Home Tuition Kathmandu</title>
        <meta name="description" content="Read EduWarn Nepal's privacy policy. Learn how we collect, use, and protect your personal information for home tuition services in Kathmandu." />
        <link rel="canonical" href="https://sajilotuition.com/privacy-policy" />
      </Helmet>
      <Navbar />
      
      <main className="flex-grow bg-background py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8">Privacy Policy</h1>
          
          <div className="bg-card rounded-lg shadow-md p-6 md:p-8 space-y-6 border">
            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Introduction</h2>
              <p className="text-muted-foreground">Last updated: February 27, 2026</p>
              <p className="text-muted-foreground mt-3">
                EduWarn Nepal ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by EduWarn Nepal when you use our website (sajilotuition.com) and our services.
              </p>
              <p className="text-muted-foreground mt-3">
                By accessing or using our services, you signify that you have read, understood, and agree to our collection, storage, use, and disclosure of your personal information as described in this Privacy Policy.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Information We Collect</h2>
              <p className="text-muted-foreground">
                We collect information that you provide directly to us when you register for an account, enroll in courses, participate in interactive features of our service, submit information, communicate with us, or otherwise use our services.
              </p>
              <ul className="list-disc pl-6 mt-2 text-muted-foreground">
                <li>Contact information (such as name, email address, phone number)</li>
                <li>Account information (such as educational background, login credentials)</li>
                <li>Payment information</li>
                <li>Course preferences and educational interests</li>
                <li>Communications you send to us</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-primary mb-3">How We Use Your Information</h2>
              <ul className="list-disc pl-6 mt-2 text-muted-foreground">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send administrative information, such as updates, security alerts, and support messages</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Monitor and analyze trends, usage, and activities</li>
                <li>Detect, investigate, and prevent fraudulent transactions</li>
                <li>Personalize your experience</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Your Rights</h2>
              <ul className="list-disc pl-6 mt-2 text-muted-foreground">
                <li>The right to access your personal information</li>
                <li>The right to correct inaccurate or incomplete information</li>
                <li>The right to request deletion of your personal information</li>
                <li>The right to object to our processing of your personal information</li>
                <li>The right to withdraw consent at any time</li>
              </ul>
              <p className="text-muted-foreground mt-3">To exercise these rights, please contact us at team.eduwarn@gmail.com.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Contact Us</h2>
              <p className="text-muted-foreground mt-2">
                Email: team.eduwarn@gmail.com<br />
                Phone: +977 9765550265<br />
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

export default PrivacyPolicy;
