
import React from 'react';
import { Phone } from 'lucide-react';

const WhatsAppButton: React.FC = () => {
  return (
    <a 
      href="https://wa.me/9765550265" 
      className="fixed bottom-6 right-6 bg-green-500 text-white p-3 rounded-full shadow-lg z-50 hover:bg-green-600 transition-colors"
      aria-label="Contact us on WhatsApp"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Phone size={24} />
    </a>
  );
};

export default WhatsAppButton;
