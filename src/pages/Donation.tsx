import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Heart, Mail, Phone, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';
import { sanitizeInput, validateEmail, validatePhone } from '@/utils/security';

interface DonationFormData {
  fullName: string;
  email: string;
  phone: string;
  donationAmount: string;
  donationType: string;
  purpose: string;
  message: string;
  receiptEmail: boolean;
}

const Donation = () => {
  const [formData, setFormData] = useState<DonationFormData>({
    fullName: '',
    email: '',
    phone: '',
    donationAmount: '',
    donationType: 'one-time',
    purpose: '',
    message: '',
    receiptEmail: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }

    if (!validatePhone(formData.phone)) {
      toast.error('Please enter a valid phone number.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.donationAmount || parseFloat(formData.donationAmount) <= 0) {
      toast.error('Please enter a valid donation amount.');
      setIsSubmitting(false);
      return;
    }

    try {
      const sanitizedData = {
        fullName: sanitizeInput(formData.fullName),
        email: sanitizeInput(formData.email),
        phone: sanitizeInput(formData.phone),
        donationAmount: parseFloat(formData.donationAmount),
        donationType: sanitizeInput(formData.donationType),
        purpose: sanitizeInput(formData.purpose),
        message: sanitizeInput(formData.message),
      };

      const { error } = await supabase.from('donations').insert([
        {
          donor_name: sanitizedData.fullName,
          email: sanitizedData.email,
          phone: sanitizedData.phone,
          amount: sanitizedData.donationAmount,
          donation_type: sanitizedData.donationType,
          purpose: sanitizedData.purpose,
          message: sanitizedData.message,
          status: 'pending',
          send_receipt: formData.receiptEmail
        }
      ]);

      if (error) throw error;

      toast.success('Thank you for your generous donation! We will process it shortly.');
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        donationAmount: '',
        donationType: 'one-time',
        purpose: '',
        message: '',
        receiptEmail: true
      });
    } catch (error) {
      console.error('Donation submission failed:', error);
      toast.error('Failed to process donation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Support EduWarn Nepal | Make a Donation</title>
        <meta name="description" content="Donate to EduWarn Nepal and support free, practical education for students across Nepal. Every contribution makes a difference." />
      </Helmet>
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Heart size={32} />
            <h1 className="text-3xl md:text-4xl font-bold">Support Our Mission</h1>
          </div>
          <p className="text-lg max-w-2xl text-red-100">
            Help us provide free, practical education to students across Nepal. Your donation makes quality learning accessible to everyone.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-grow py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Impact Cards */}
            <div className="bg-card rounded-xl shadow-lg border p-6 text-center">
              <div className="text-3xl font-bold text-red-500 mb-2">₹500</div>
              <p className="text-sm text-muted-foreground mb-4">Provides study materials for 1 student</p>
              <button
                onClick={() => setFormData(prev => ({ ...prev, donationAmount: '500', purpose: 'Study Materials' }))}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Select
              </button>
            </div>
            <div className="bg-card rounded-xl shadow-lg border p-6 text-center">
              <div className="text-3xl font-bold text-red-500 mb-2">₹2,000</div>
              <p className="text-sm text-muted-foreground mb-4">Supports a tutor's monthly training</p>
              <button
                onClick={() => setFormData(prev => ({ ...prev, donationAmount: '2000', purpose: 'Tutor Training' }))}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Select
              </button>
            </div>
            <div className="bg-card rounded-xl shadow-lg border p-6 text-center">
              <div className="text-3xl font-bold text-red-500 mb-2">₹5,000</div>
              <p className="text-sm text-muted-foreground mb-4">Reaches 50+ students with online courses</p>
              <button
                onClick={() => setFormData(prev => ({ ...prev, donationAmount: '5000', purpose: 'Course Development' }))}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Select
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-card rounded-xl shadow-lg border p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-red-500 mb-2">Make Your Contribution</h2>
                <p className="text-muted-foreground">Choose the donation amount and let us know how you'd like to help.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                    <Mail size={20} /> Your Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="+977 98XXXXXXXX"
                    />
                  </div>
                </div>

                {/* Donation Details */}
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                    <Heart size={20} /> Donation Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Donation Type *</label>
                      <select
                        name="donationType"
                        value={formData.donationType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="one-time">One-time Donation</option>
                        <option value="monthly">Monthly Recurring</option>
                        <option value="annual">Annual Donation</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Donation Amount (₹) *</label>
                      <input
                        type="number"
                        name="donationAmount"
                        value={formData.donationAmount}
                        onChange={handleInputChange}
                        required
                        min="100"
                        step="100"
                        className="w-full px-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Enter amount"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Minimum: ₹100</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Purpose of Donation *</label>
                      <select
                        name="purpose"
                        value={formData.purpose}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">Select a purpose</option>
                        <option value="General Fund">General Fund</option>
                        <option value="Study Materials">Study Materials for Students</option>
                        <option value="Tutor Training">Tutor Training & Development</option>
                        <option value="Course Development">Course Development</option>
                        <option value="Technology Infrastructure">Technology Infrastructure</option>
                        <option value="Scholarship">Student Scholarships</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium mb-2">Message (Optional)</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Share your motivation for donating or any special message..."
                  />
                </div>

                {/* Receipt Option */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="receiptEmail"
                    checked={formData.receiptEmail}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-input focus:ring-2 focus:ring-red-500"
                  />
                  <label className="ml-3 text-sm">Send donation receipt to my email</label>
                </div>

                {/* Info Box */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-amber-900">
                    ✓ All donations are secure and processed through trusted payment partners.<br />
                    ✓ You will receive a donation receipt for tax purposes (if applicable).<br />
                    ✓ 100% of your donation goes towards supporting our educational mission.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Heart size={20} />
                  {isSubmitting ? 'Processing...' : `Donate Now - ₹${formData.donationAmount || '0'}`}
                </button>
              </form>
            </div>

            {/* Tax Info */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3">🏛️ Tax Benefits</h3>
              <p className="text-sm text-blue-900">
                EduWarn Nepal is working towards registration as a recognized educational non-profit. Upon registration, donations may be eligible for tax deductions as per Nepal's tax laws. We'll provide all necessary documentation.
              </p>
            </div>

            {/* Contact Alternative */}
            <div className="mt-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 border border-red-200">
              <p className="text-sm text-red-900">
                Questions about donations? Contact us at <a href="mailto:support@eduwarnnepal.com" className="font-semibold hover:underline">support@eduwarnnepal.com</a> or call <a href="tel:+9779816254775" className="font-semibold hover:underline">+977 9816254775</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Donation;
