import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BookOpen, Mail, Phone, MapPin, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';
import { sanitizeInput, validateEmail, validatePhone } from '@/utils/security';

interface TutorApplicationData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  subjects: string;
  experience: string;
  qualifications: string;
  availability: string;
  message: string;
}

const TutorApplication = () => {
  const [formData, setFormData] = useState<TutorApplicationData>({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    subjects: '',
    experience: '',
    qualifications: '',
    availability: '',
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
        fullName: sanitizeInput(formData.fullName),
        email: sanitizeInput(formData.email),
        phone: sanitizeInput(formData.phone),
        location: sanitizeInput(formData.location),
        subjects: sanitizeInput(formData.subjects),
        experience: sanitizeInput(formData.experience),
        qualifications: sanitizeInput(formData.qualifications),
        availability: sanitizeInput(formData.availability),
        message: sanitizeInput(formData.message),
      };

      const { error } = await supabase.from('tutor_applications').insert([
        {
          full_name: sanitizedData.fullName,
          email: sanitizedData.email,
          phone: sanitizedData.phone,
          location: sanitizedData.location,
          subjects: sanitizedData.subjects,
          experience: sanitizedData.experience,
          qualifications: sanitizedData.qualifications,
          availability: sanitizedData.availability,
          message: sanitizedData.message,
          status: 'pending'
        }
      ]);

      if (error) throw error;

      toast.success('Application submitted successfully! We\'ll contact you soon.');
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        location: '',
        subjects: '',
        experience: '',
        qualifications: '',
        availability: '',
        message: ''
      });
    } catch (error) {
      console.error('Application submission failed:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Apply as Tutor | Home Tutors in Nepal | EduWarn Nepal</title>
        <meta name="description" content="Apply to become a tutor at EduWarn Nepal. Join our community of educators and help students learn practical skills." />
      </Helmet>
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen size={32} />
            <h1 className="text-3xl md:text-4xl font-bold">Apply as a Tutor</h1>
          </div>
          <p className="text-lg max-w-2xl text-gray-100">
            Join EduWarn Nepal and share your knowledge with students across Nepal. Help shape the future of practical education.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-grow py-12 bg-background">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-card rounded-xl shadow-lg border p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-2">Tell us about yourself</h2>
              <p className="text-muted-foreground">Share your teaching background and expertise to help us get to know you better.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                  <Mail size={20} /> Personal Information
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
                      className="w-full px-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-primary"
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
                      className="w-full px-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
              </div>

              {/* Contact & Location */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                  <Phone size={20} /> Contact & Location
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-primary"
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
                      className="w-full px-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., Kathmandu, Lalitpur"
                    />
                  </div>
                </div>
              </div>

              {/* Teaching Background */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                  <BookOpen size={20} /> Teaching Background
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Subjects You Can Teach *</label>
                    <textarea
                      name="subjects"
                      value={formData.subjects}
                      onChange={handleInputChange}
                      required
                      rows={2}
                      className="w-full px-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., Mathematics, Physics, Chemistry, English, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Years of Teaching Experience *</label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select experience level</option>
                      <option value="0-1">Less than 1 year</option>
                      <option value="1-3">1-3 years</option>
                      <option value="3-5">3-5 years</option>
                      <option value="5-10">5-10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Qualifications / Certifications *</label>
                    <textarea
                      name="qualifications"
                      value={formData.qualifications}
                      onChange={handleInputChange}
                      required
                      rows={2}
                      className="w-full px-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., Bachelor of Science, NEB Certified, IELTS Score: 7.5, etc."
                    />
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Availability</h3>
                <div>
                  <label className="block text-sm font-medium mb-2">When can you teach? *</label>
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select availability</option>
                    <option value="weekends">Weekends only</option>
                    <option value="weekdays">Weekdays only</option>
                    <option value="evenings">Evenings (after 5 PM)</option>
                    <option value="flexible">Flexible/Part-time</option>
                    <option value="full-time">Full-time</option>
                  </select>
                </div>
              </div>

              {/* Additional Message */}
              <div>
                <label className="block text-sm font-medium mb-2">Tell us more about yourself</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Share anything else you'd like us to know about your teaching style, interests, or goals..."
                />
              </div>

              {/* Submit Button */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900">
                  ✓ Your application will be reviewed by our team within 24-48 hours.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>

          {/* Contact Alternative */}
          <div className="mt-8 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-primary/20">
            <p className="text-sm text-muted-foreground">
              Have questions? Contact us at <a href="mailto:tutors@eduwarnnepal.com" className="font-semibold text-primary hover:underline">tutors@eduwarnnepal.com</a> or call <a href="tel:+9779816254775" className="font-semibold text-primary hover:underline">+977 9816254775</a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TutorApplication;
