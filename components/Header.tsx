import React, { useState } from 'react';
import { MenuIcon } from './icons/MenuIcon';
import { XIcon } from './icons/XIcon';
import { NAVIGATION_ITEMS, SITE_CONFIG } from '../constants';
import type { HeaderProps } from '../types';

export const Header: React.FC<HeaderProps> = ({ activeSection }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-ivory/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => scrollToSection('home')}
              className="font-serif text-xl font-bold text-coffee-dark hover:text-vivid-pink transition-colors duration-300"
            >
              {SITE_CONFIG.title}
            </button>

            <nav className="hidden md:flex space-x-8">
              {NAVIGATION_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`relative font-medium transition-colors duration-300 ${
                    activeSection === item.id ? 'text-vivid-pink' : 'text-coffee-dark hover:text-vivid-pink'
                  }`}
                >
                  {item.label}
                  {activeSection === item.id && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-vivid-pink transform origin-left animate-pulse" />
                  )}
                </button>
              ))}
            </nav>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-coffee-dark hover:text-vivid-pink transition-colors duration-300"
            >
              {isMenuOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-coffee-dark/50" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-64 bg-ivory shadow-xl transform transition-transform duration-300">
            <div className="pt-20 px-6">
              <nav className="space-y-6">
                {NAVIGATION_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`block w-full text-left font-medium text-lg transition-colors duration-300 ${
                      activeSection === item.id ? 'text-vivid-pink' : 'text-coffee-dark hover:text-vivid-pink'
                    }`}
                  >
                    {item.label}
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