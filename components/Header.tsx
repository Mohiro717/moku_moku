import React, { useState, useEffect } from 'react';
import { MenuIcon } from './icons/MenuIcon';
import { XIcon } from './icons/XIcon';
import { NAVIGATION_ITEMS, SITE_CONFIG } from '../constants';
export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const getCurrentSection = () => {
    const scrollY = window.scrollY;
    
    // If at the very top, return home
    if (scrollY < 100) return 'home';
    
    // Get all section elements
    const sectionIds = ['about', 'mokopi', 'works', 'game'];
    
    // Find the section that is most visible in the viewport
    let currentSection = 'home';
    let maxVisibility = 0;
    
    for (const sectionId of sectionIds) {
      const element = document.getElementById(sectionId);
      if (!element) continue;
      
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top;
      const elementBottom = rect.bottom;
      const viewportHeight = window.innerHeight;
      
      // Calculate how much of the section is visible
      const visibleTop = Math.max(0, elementTop);
      const visibleBottom = Math.min(viewportHeight, elementBottom);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);
      const sectionHeight = rect.height;
      const visibilityRatio = visibleHeight / sectionHeight;
      
      // If this section is more visible than the current one, use it
      if (visibilityRatio > maxVisibility && visibilityRatio > 0.3) {
        maxVisibility = visibilityRatio;
        currentSection = sectionId;
      }
    }
    
    return currentSection;
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      setActiveSection(getCurrentSection());
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Set initial state
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        const headerHeight = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
    setIsMenuOpen(false);
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-ivory/60 backdrop-blur-md shadow-lg' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <button
              onClick={() => scrollToSection('home')}
              className="font-serif text-xl sm:text-2xl font-bold text-coffee-dark hover:text-vivid-pink transition-colors duration-300"
            >
              {SITE_CONFIG.title}
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {NAVIGATION_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`font-medium transition-all duration-300 relative ${
                    activeSection === item.id 
                      ? 'text-vivid-pink' 
                      : 'text-coffee-dark hover:text-vivid-pink'
                  }`}
                >
                  {item.label}
                  {activeSection === item.id && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-vivid-pink rounded-full animate-pulse"></div>
                  )}
                </button>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-coffee-dark hover:text-vivid-pink transition-colors duration-300 p-2"
              aria-label="メニューを開く"
            >
              {isMenuOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Background overlay */}
          <div 
            className="fixed inset-0 bg-coffee-dark/50 backdrop-blur-sm" 
            onClick={closeMenu} 
          />
          
          {/* Menu drawer */}
          <div className="fixed top-0 right-0 h-full w-80 max-w-full bg-ivory shadow-xl transform transition-transform duration-300">
            <div className="pt-24 px-8">
              <nav className="space-y-8">
                {NAVIGATION_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`block w-full text-left font-medium text-xl transition-colors duration-300 relative ${
                      activeSection === item.id 
                        ? 'text-vivid-pink' 
                        : 'text-coffee-dark hover:text-vivid-pink'
                    }`}
                  >
                    {item.label}
                    {activeSection === item.id && (
                      <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-vivid-pink rounded-full animate-pulse"></div>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
};