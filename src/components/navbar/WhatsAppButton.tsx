
import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

const WhatsAppButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide button when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 300) {
        setIsMinimized(true);
        setScrollDirection('down');
      } else {
        setIsMinimized(false);
        setScrollDirection('up');
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  if (!isVisible) return null;

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 bg-green-500 text-white p-2 rounded-full shadow-lg z-40 hover:bg-green-600 transition-all duration-300 hover:scale-110"
        aria-label="Show WhatsApp"
        title="Chat with us"
      >
        <MessageCircle size={20} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-xs">
        {/* Header */}
        <div className="bg-green-500 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <MessageCircle size={20} className="text-green-500" />
            </div>
            <div>
              <p className="font-semibold text-sm">EduWarn Nepal</p>
              <p className="text-xs text-green-100">Usually replies instantly</p>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="hover:bg-green-600 p-1 rounded transition-colors"
            aria-label="Close WhatsApp"
          >
            <X size={18} />
          </button>
        </div>

        {/* Message */}
        <div className="p-4 bg-gray-50">
          <p className="text-sm text-gray-700 mb-4">
            Hi! 👋 Have questions about our courses or tuition? Feel free to reach out on WhatsApp!
          </p>
          <a
            href="https://wa.me/9765550265?text=Hello%20EduWarn%20Nepal%2C%20I%20have%20a%20question%20about%20your%20services"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={18} />
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppButton;

