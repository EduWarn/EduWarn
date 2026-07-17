import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Handshake, Mail, Phone, MapPin, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';
import { sanitizeInput, validateEmail, validatePhone } from '@/utils/security';

interface PartnershipFormData {
  organizationName: string;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
  partnershipType: string;
  description: string;
  website: string;
  message: string;
}

const PartnershipForm = () => {
  const [formData, setFormData] = useState<PartnershipFormData>({
    organizationName: '',
    contactPerson: '',
    email: '',
    phone: '',
    location: '',
    partnershipType: '',
    description: '',
    website: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

    try {
      const sanitizedData = {
        organizationName: sanitizeInput(formData.organizationName),
        contactPerson: sanitizeInput(formData.contactPerson),
        email: sanitizeInput(formData.email),
        phone: sanitizeInput(formData.phone),
        location: sanitizeInput(formData.location),
        partnershipType: sanitizeInput(formData.partnershipType),
        description: sanitizeInput(formData.description),
        website: sanitizeInput(formData.website),
        message: sanitizeInput(formData.message),
      };

      const { error } = await supabase.from('partnership_inquiries').insert([
        {
          organization_name: sanitizedData.organizationName,
          contact_person: sanitizedData.contactPerson,
          email: sanitizedData.email,
          phone: sanitizedData.phone,
          location: sanitizedData.location,
          partnership_type: sanitizedData.partnershipType,
          description: sanitizedData.description,
          website: sanitizedData.website,
          message: sanitizedData.message,
          status: 'pending'
        }
      ]);

      if (error) throw error;

      toast.success('Partnership inquiry submitted! We\'ll reach out soon.');
      setFormData({
        organizationName: '',
        contactPerson: '',
        email: '',
        phone: '',
        location: '',
        partnershipType: '',
        description: '',
        website: '',
        message: ''
      });
    } catch (error) {
      console.error('Form submission failed:', error);
      toast.error('Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Partner with EduWarn Nepal | Education Partnership Program</title>
        <meta name="description" content="Join our partnership program and collaborate with EduWarn Nepal to expand educational opportunities across Nepal." />
      </Helmet>
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Handshake size={32} />
            <h1 className="text-3xl md:text-4xl font-bold">Partner With Us</h1>
          </div>
          <p className="text-lg max-w-2xl text-gray-100">
            Expand educational access across Nepal. Collaborate with EduWarn Nepal to create meaningful learning opportunities.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-grow py-12 bg-background">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-card rounded-xl shadow-lg border p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-secondary mb-2">Let's grow together</h2>
              <p className="text-muted-foreground">Tell us about your organization and how we can partner to expand education in Nepal.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Organization Information */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-secondary mb-4">Organization Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Organization Name *</label>
                    <input
                      type="text"
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-secondary"
                      placeholder="Your organization name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Website / Social Media (if any)</label>
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-secondary"
                      placeholder="https://your-website.com"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-2">
                  <Mail size={20} /> Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Contact Person *</label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-secondary"
                      placeholder="Your name"
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
                      className="w-full px-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-secondary"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-secondary"
                      placeholder="+977 98XXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Location / District *</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-secondary"
                      placeholder="e.g., Kathmandu, Pokhara"
                    />
                  </div>
                </div>
              </div>

              {/* Partnership Details */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-2">
                  <Handshake size={20} /> Partnership Type
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Type of Partnership *</label>
                    <select
                      name="partnershipType"
                      value={formData.partnershipType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                      <option value="">Select partnership type</option>
                      <option value="school">School / College</option>
                      <option value="educational-institution">Educational Institution</option>
                      <option value="coaching-center">Coaching Center / Tuition</option>
                      <option value="corporate">Corporate / CSR</option>
                      <option value="ngo">NGO / Non-Profit</option>
                      <option value="tech-platform">Technology Platform</option>
                      <option value="content-provider">Content Provider</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Organization Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-secondary"
                      placeholder="Brief description of your organization, its mission, and what you do..."
                    />
                  </div>
                </div>
              </div>

              {/* Partnership Proposal */}
              <div>
                <label className="block text-sm font-medium mb-2">Partnership Proposal / Ideas</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="What kind of partnership are you interested in? How can we collaborate to benefit students?"
                />
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900">
                  ✓ We review partnership inquiries within 2-3 business days and will contact you to discuss opportunities.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
                {isSubmitting ? 'Submitting...' : 'Submit Partnership Inquiry'}
              </button>
            </form>
          </div>

          {/* Contact Alternative */}
          <div className="mt-8 bg-gradient-to-r from-secondary/10 to-primary/10 rounded-xl p-6 border border-secondary/20">
            <p className="text-sm text-muted-foreground">
              Prefer to discuss first? Email us at <a href="mailto:partners@eduwarnnepal.com" className="font-semibold text-secondary hover:underline">partners@eduwarnnepal.com</a> or call <a href="tel:+9779816254775" className="font-semibold text-secondary hover:underline">+977 9816254775</a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PartnershipForm;
