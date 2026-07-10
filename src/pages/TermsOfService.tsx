import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async';

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Terms of Service | EduWarn Nepal - Home Tuition Kathmandu</title>
        <meta name="description" content="Read the terms of service for EduWarn Nepal. Understand our policies for home tuition services, course enrollment, and payments in Kathmandu." />
        <link rel="canonical" href="https://eduwarnnepal.com/terms-of-service" />
      </Helmet>
      <Navbar />
      
      <main className="flex-grow bg-background py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8">Terms of Service</h1>
          
          <div className="bg-card rounded-lg shadow-md p-6 md:p-8 space-y-6 border">
            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Introduction</h2>
              <p className="text-muted-foreground">Last updated: February 27, 2026</p>
              <p className="text-muted-foreground mt-3">
                These Terms of Service ("Terms") govern your access to and use of the services, including our website, provided by EduWarn Nepal ("we," "our," or "us").
              </p>
              <p className="text-muted-foreground mt-3">
                By accessing or using our services, you agree to be bound by these Terms.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Use of Services</h2>
              <p className="text-muted-foreground">You may use our services only as permitted by these Terms and any applicable laws.</p>
              <ul className="list-disc pl-6 mt-2 text-muted-foreground">
                <li>Do not use our services in any way that could damage or impair them</li>
                <li>Do not attempt to gain unauthorized access to our services</li>
                <li>Do not violate the intellectual property rights of others</li>
                <li>Do not use our services for any illegal purpose</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Course Enrollment and Payment</h2>
              <p className="text-muted-foreground">
                By enrolling in a course, you agree to pay the specified fees. All payments are non-refundable except as expressly set forth in our Refund Policy. Prices are subject to change at any time.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-primary mb-3">Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms shall be governed by and construed in accordance with the laws of Nepal.
              </p>
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

export default TermsOfService;
