import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare } from 'lucide-react';
import { submitContactForm, initiateWhatsAppChat, ContactFormData } from '../utils/contactHelpers';
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { sanitizeInput, validateEmail, validatePhone, rateLimit } from '@/utils/security';
import { useSectionContent } from '@/hooks/useSectionContent';
import { Skeleton } from '@/components/ui/skeleton';

const Contact = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '', email: '', phone: '', subject: '', message: '', whatsappOptIn: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: contactContent, isLoading: contentLoading } = useSectionContent('contact_info_content');
  const info = contactContent?.content as {
    address?: string; address_detail?: string; phone?: string; whatsapp?: string;
    email?: string; support_email?: string; office_hours_weekday?: string;
    office_hours_weekend?: string; map_embed_url?: string;
  } | undefined;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const clientId = formData.email || 'anonymous';
    if (!rateLimit.canAttempt(`contact_${clientId}`, 3, 60 * 60 * 1000)) {
      toast.error('Too many contact form submissions. Please try again later.');
      setIsSubmitting(false);
      return;
    }
    const sanitizedData = {
      ...formData,
      fullName: sanitizeInput(formData.fullName), email: sanitizeInput(formData.email),
      phone: sanitizeInput(formData.phone), subject: sanitizeInput(formData.subject),
      message: sanitizeInput(formData.message)
    };
    if (!validateEmail(sanitizedData.email)) { toast.error('Please enter a valid email address.'); setIsSubmitting(false); return; }
    if (!validatePhone(sanitizedData.phone)) { toast.error('Please enter a valid phone number.'); setIsSubmitting(false); return; }
    try {
      await submitContactForm(sanitizedData);
      setFormData({ fullName: '', email: '', phone: '', subject: '', message: '', whatsappOptIn: false });
    } catch (error) {
      if (import.meta.env.DEV) console.error("Form submission failed:", error);
    } finally { setIsSubmitting(false); }
  };

  const handleWhatsAppChat = () => {
    const whatsappNum = info?.whatsapp?.replace(/\D/g, '') || '9779816254775';
    initiateWhatsAppChat(whatsappNum);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Contact EduWarn Nepal | Free Learning & Study Support</title>
        <meta name="description" content="Contact EduWarn Nepal for free learning support, study resources, and practical education guidance." />
      </Helmet>
      <Navbar />
      <div className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg max-w-2xl">Get in touch with our team for free learning support, course guidance, or questions about our practical study resources.</p>
        </div>
      </div>

      <div className="flex-grow py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="bg-card rounded-xl shadow-lg overflow-hidden border">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 md:p-12 bg-primary text-white">
                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                {contentLoading ? (
                  <div className="space-y-6">{[1,2,3,4].map(i => <Skeleton key={i} className="h-16 w-full bg-white/20" />)}</div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-start"><MapPin size={24} className="mr-4 flex-shrink-0" /><div><h3 className="font-semibold mb-1">Our Location</h3><p>{info?.address || 'New Baneshwor, Kathmandu, Nepal'}</p><p>{info?.address_detail || 'Near Kumari Bank, 2nd Floor'}</p></div></div>
                    <div className="flex items-start"><Phone size={24} className="mr-4 flex-shrink-0" /><div><h3 className="font-semibold mb-1">Phone Numbers</h3><p>{info?.phone || '+977 9816254775'}</p><p><a href={`https://wa.me/${(info?.whatsapp || '9779816254775').replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-amber-300 transition-colors">{info?.phone || '+977 9816254775'}<span className="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded">WhatsApp</span></a></p></div></div>
                    <div className="flex items-start"><Mail size={24} className="mr-4 flex-shrink-0" /><div><h3 className="font-semibold mb-1">Email</h3><p>{info?.email || 'team.eduwarn@gmail.com'}</p><p>{info?.support_email || 'sabinbd7@gmail.com'}</p></div></div>
                    <div className="flex items-start"><Clock size={24} className="mr-4 flex-shrink-0" /><div><h3 className="font-semibold mb-1">Office Hours</h3><p>{info?.office_hours_weekday || 'Sunday to Friday: 8:00 AM - 6:00 PM'}</p><p>{info?.office_hours_weekend || 'Saturday: 9:00 AM - 2:00 PM'}</p></div></div>
                  </div>
                )}
              </div>

              <div className="p-8 md:p-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">Send Us a Message</h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label htmlFor="fullName" className="block text-sm font-medium text-muted-foreground mb-1">Full Name</label><input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Your full name" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background" required /></div>
                    <div><label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-1">Email Address</label><input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Your email address" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background" required /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label htmlFor="phone" className="block text-sm font-medium text-muted-foreground mb-1">Phone Number</label><input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Your phone number" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background" required /><div className="mt-2 flex items-center"><input type="checkbox" id="whatsappOptIn" name="whatsappOptIn" checked={formData.whatsappOptIn} onChange={handleCheckboxChange} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" /><label htmlFor="whatsappOptIn" className="ml-2 text-xs text-muted-foreground">I agree to receive messages via WhatsApp</label></div></div>
                    <div><label htmlFor="subject" className="block text-sm font-medium text-muted-foreground mb-1">Subject</label><select id="subject" name="subject" value={formData.subject} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background" required><option value="">Select an option</option><option value="inquiry">General Inquiry</option><option value="admission">Admission Information</option><option value="courses">Course Details</option><option value="feedback">Feedback</option><option value="support">Technical Support</option></select></div>
                  </div>
                  <div><label htmlFor="message" className="block text-sm font-medium text-muted-foreground mb-1">Message</label><textarea id="message" name="message" value={formData.message} onChange={handleInputChange} rows={5} placeholder="Your message..." className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background" required></textarea></div>
                  <button type="submit" className="btn-primary flex items-center justify-center gap-2" disabled={isSubmitting}><Send size={18} />{isSubmitting ? 'Sending...' : 'Send Message'}</button>
                </form>
              </div>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-xl shadow-md p-6 text-center border"><div className="bg-primary/10 w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-4"><MessageSquare size={28} className="text-primary" /></div><h3 className="text-lg font-semibold mb-2">WhatsApp Support</h3><p className="text-muted-foreground mb-4">Get instant answers to your questions through our WhatsApp support.</p><button onClick={handleWhatsAppChat} className="w-full btn-secondary text-sm py-2 flex items-center justify-center gap-2">Chat on WhatsApp</button></div>
            <div className="bg-card rounded-xl shadow-md p-6 text-center border"><div className="bg-primary/10 w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-4"><Phone size={28} className="text-primary" /></div><h3 className="text-lg font-semibold mb-2">Request Callback</h3><p className="text-muted-foreground mb-4">Schedule a callback from our counselors at your convenient time.</p><button className="w-full btn-secondary text-sm py-2">Request Call</button></div>
            <div className="bg-card rounded-xl shadow-md p-6 text-center border"><div className="bg-primary/10 w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-4"><MapPin size={28} className="text-primary" /></div><h3 className="text-lg font-semibold mb-2">Visit Our Center</h3><p className="text-muted-foreground mb-4">Schedule a visit to our learning center to meet our teachers.</p><button className="w-full btn-secondary text-sm py-2">Book Appointment</button></div>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-center">Find Us On Map</h2>
            <div className="rounded-xl overflow-hidden h-96 shadow-md">
              <iframe src={info?.map_embed_url || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.2715204568484!2d85.31415931506156!3d27.70496698279232!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb19009f2d769f%3A0xc5670a9173e161d0!2sNewBaneshwor%2C%20Kathmandu%2044600!5e0!3m2!1sen!2snp!4v1634720778548!5m2!1sen!2snp"} width="100%" height="100%" style={{ border: 0 }} allowFullScreen={true} loading="lazy" title="EduWarn Nepal Location" />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
