import React, { useState, useEffect } from 'react';
import { navLinks } from '../constants';
import { MenuIcon } from './icons/MenuIcon';
import { XIcon } from './icons/XIcon';

interface HeaderProps {
  activeSection: string;
}

const Header: React.FC<HeaderProps> = ({ activeSection }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);

    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  const handleScrollTo = (id: string) => {
    if (id === 'home') {
       window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled || isMenuOpen ? 'bg-ivory/80 backdrop-blur-sm shadow-md' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center h-20">
          <div
            onClick={() => handleScrollTo('home')}
            className="font-serif text-2xl text-coffee-dark cursor-pointer hover:text-vivid-pink transition-colors"
          >
            Moku Moku House
          </div>
          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              {navLinks.map(link => (
                <li key={link.id}>
                  <button
                    onClick={() => handleScrollTo(link.id)}
                    className="relative text-lg text-coffee-dark hover:text-vivid-pink transition-colors duration-300"
                  >
                    {link.label}
                    <span
                      className={`absolute left-0 -bottom-1 w-full h-0.5 bg-vivid-pink transform transition-transform duration-300 ${
                        activeSection === link.id ? 'scale-x-100' : 'scale-x-0'
                      }`}
                    ></span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(true)} className="text-coffee-dark" aria-label="Open menu">
              <MenuIcon className="w-8 h-8"/>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[60] transform transition-transform duration-300 ease-in-out md:hidden ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } bg-ivory/95 backdrop-blur-lg`}
      >
        <div className="container mx-auto px-6 flex justify-end items-center h-20">
            <button onClick={() => setIsMenuOpen(false)} className="text-coffee-dark" aria-label="Close menu">
                <XIcon className="w-8 h-8"/>
            </button>
        </div>
        <nav className="flex flex-col items-center justify-center h-[calc(100vh-80px)] -mt-10">
          <ul className="flex flex-col space-y-8 text-center">
            {navLinks.map(link => (
              <li key={link.id}>
                <button
                  onClick={() => handleScrollTo(link.id)}
                  className="text-3xl font-serif text-coffee-dark hover:text-vivid-pink transition-colors"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Header;
