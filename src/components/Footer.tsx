import React from 'react';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSectionContent } from '@/hooks/useSectionContent';

const Footer = () => {
  const { data: contactContent } = useSectionContent('contact_info_content');
  const info = contactContent?.content as {
    address?: string;
    phone?: string;
    email?: string;
    office_hours_weekday?: string;
    office_hours_weekend?: string;
  } | undefined;

  const { data: socialContent } = useSectionContent('social_links_content');
  const social = socialContent?.content as {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    linkedin?: string;
  } | undefined;

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-xl font-bold mb-4">EduWarn Nepal</h3>
            <p className="text-gray-300 mb-4">
              Empowering students to achieve academic excellence through personalized coaching, home tuition in Kathmandu, and quality education for SEE preparation since 2024.
            </p>
            <div className="flex space-x-4">
              {social?.facebook && <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-accent" aria-label="Facebook"><Facebook size={20} /></a>}
              {social?.twitter && <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-accent" aria-label="Twitter"><Twitter size={20} /></a>}
              {social?.instagram && <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-accent" aria-label="Instagram"><Instagram size={20} /></a>}
              {social?.youtube && <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-accent" aria-label="YouTube"><Youtube size={20} /></a>}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/courses" className="text-gray-300 hover:text-accent">Courses</Link></li>
              <li><Link to="/tutors" className="text-gray-300 hover:text-accent">Our Teachers</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-accent">About Us</Link></li>
              <li><Link to="/blog" className="text-gray-300 hover:text-accent">Blog</Link></li>
              <li><Link to="/career" className="text-gray-300 hover:text-accent">Career</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-accent">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Popular Courses</h3>
            <ul className="space-y-3">
              <li><Link to="/courses?search=SEE" className="text-gray-300 hover:text-accent">SEE Complete Preparation</Link></li>
              <li><Link to="/courses?search=Grade+11" className="text-gray-300 hover:text-accent">Grade 11 Science</Link></li>
              <li><Link to="/courses?search=Grade+12" className="text-gray-300 hover:text-accent">Grade 12 Mathematics</Link></li>
              <li><Link to="/courses?search=IELTS" className="text-gray-300 hover:text-accent">IELTS Preparation</Link></li>
              <li><Link to="/courses?search=LokSewa" className="text-gray-300 hover:text-accent">LokSewa Preparation</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={20} className="mr-3 mt-1 text-accent flex-shrink-0" />
                <span className="text-gray-300">{info?.address || 'New Baneshwor, Kathmandu, Nepal'}</span>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="mr-3 text-accent flex-shrink-0" />
                <a href={`tel:${info?.phone || '+977 9765550265'}`} className="text-gray-300 hover:text-accent">{info?.phone || '+977 9765550265'}</a>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="mr-3 text-accent flex-shrink-0" />
                <a href={`mailto:${info?.email || 'team.eduwarn@gmail.com'}`} className="text-gray-300 hover:text-accent">{info?.email || 'team.eduwarn@gmail.com'}</a>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="font-medium mb-2">Working Hours</h4>
              <p className="text-gray-300">{info?.office_hours_weekday || 'Sunday - Friday: 8:00 AM - 6:00 PM'}</p>
              <p className="text-gray-300">{info?.office_hours_weekend || 'Saturday: 9:00 AM - 2:00 PM'}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Sabin Budhathoki. All rights reserved. Developed by <a href="https://sabinbudhathoki.com.np" target="_blank" rel="noopener noreferrer" className="text-white underline hover:text-accent">EduWarn Nepal</a>
            </p>
            <div className="flex space-x-4 text-sm text-gray-400">
              <Link to="/privacy-policy" className="hover:text-accent">Privacy Policy</Link>
              <Link to="/terms-of-service" className="hover:text-accent">Terms of Service</Link>
              <Link to="/cookie-policy" className="hover:text-accent">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
