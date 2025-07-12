import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { AnimatedSection } from './components/AnimatedSection';
import { Blob } from './components/Blob';
import { ProjectCard } from './components/ProjectCard';
import { ChevronDownIcon } from './components/icons/ChevronDownIcon';
import { GameControllerIcon } from './components/icons/GameControllerIcon';
import { SITE_CONFIG, PROJECTS } from './constants';

export const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [mokopiHovered, setMokopiHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'mokopi', 'works', 'game'];
      const scrollPosition = window.scrollY + 100;

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToNext = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      <Header activeSection={activeSection} />

      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23f8f4e9"/><stop offset="50%" stop-color="%23e0f7fa"/><stop offset="100%" stop-color="%23d2b48c"/></linearGradient></defs><rect width="1200" height="800" fill="url(%23bg)"/></svg>')`
          }}
        />
        <div className="absolute inset-0 bg-ivory/60 backdrop-blur-sm" />
        
        <div className="relative z-10 text-center px-4">
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-coffee-dark mb-6 opacity-0 animate-fade-in-up">
            {SITE_CONFIG.title}
          </h1>
          <p className="text-xl md:text-2xl text-coffee-dark/80 mb-8 opacity-0 animate-fade-in-up animation-delay-500">
            {SITE_CONFIG.tagline}
          </p>
        </div>

        <button
          onClick={scrollToNext}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-coffee-dark/60 hover:text-vivid-pink transition-colors duration-300 animate-bounce"
        >
          <ChevronDownIcon className="w-8 h-8" />
        </button>
      </section>

      <section id="about" className="relative py-20 bg-pastel-blue overflow-hidden">
        <Blob />
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <AnimatedSection className="text-center">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-coffee-dark mb-8">
              What is Moku Moku House?
            </h2>
            <p className="text-lg md:text-xl text-coffee-dark/80 leading-relaxed max-w-3xl mx-auto">
              {SITE_CONFIG.description}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section id="mokopi" className="py-20 bg-ivory">
        <div className="max-w-6xl mx-auto px-4">
          <AnimatedSection>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="text-center md:text-left order-2 md:order-1">
                <h2 className="font-serif text-4xl md:text-5xl font-bold text-coffee-dark mb-6">
                  Meet Mokopi
                </h2>
                <p className="text-lg text-coffee-dark/80 leading-relaxed mb-6">
                  もこぴは、Moku Moku Houseのマスコットキャラクター。
                  いつも静かに創作活動を見守り、クリエイターたちを応援しています。
                </p>
                <p className="text-lg text-coffee-dark/80 leading-relaxed">
                  集中したいときも、息抜きが必要なときも、もこぴがそっと寄り添ってくれます。
                </p>
              </div>

              <div className="text-center order-1 md:order-2">
                <div
                  className={`relative inline-block transition-all duration-500 ${
                    mokopiHovered ? 'transform rotate-0' : 'transform rotate-3'
                  }`}
                  onMouseEnter={() => setMokopiHovered(true)}
                  onMouseLeave={() => setMokopiHovered(false)}
                  onClick={() => setMokopiHovered(!mokopiHovered)}
                >
                  <div
                    className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
                      mokopiHovered 
                        ? 'bg-gradient-to-br from-vivid-pink/30 to-vivid-green/30 blur-xl scale-110' 
                        : 'bg-gradient-to-br from-vivid-pink/20 to-vivid-green/20 blur-lg scale-105'
                    }`}
                  />
                  <div className="relative bg-white rounded-2xl p-8 shadow-lg">
                    <div className="w-48 h-48 mx-auto bg-gradient-to-br from-vivid-pink/10 to-vivid-green/10 rounded-full flex items-center justify-center">
                      <span className="text-6xl">
                        {mokopiHovered ? '😉' : '😊'}
                      </span>
                    </div>
                    <p className="mt-4 font-serif text-xl font-bold text-coffee-dark">
                      Mokopi
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section id="works" className="py-20 bg-pastel-blue transform skew-y-1">
        <div className="max-w-6xl mx-auto px-4 transform -skew-y-1">
          <AnimatedSection className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-coffee-dark">
              Creator's Works
            </h2>
          </AnimatedSection>

          <AnimatedSection>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {PROJECTS.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section id="game" className="py-20 bg-ivory">
        <div className="max-w-4xl mx-auto px-4">
          <AnimatedSection className="text-center">
            <div className="border-2 border-dashed border-coffee-light rounded-2xl p-12">
              <GameControllerIcon className="w-16 h-16 mx-auto text-coffee-light mb-6" />
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-coffee-dark mb-4">
                A New Game is Coming Soon!
              </h2>
              <p className="text-lg text-coffee-dark/70">
                クリエイターのための新しいゲーム体験を準備中です。お楽しみに！
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <footer className="bg-coffee-mid text-ivory py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="font-serif text-xl font-bold mb-2">{SITE_CONFIG.title}</h3>
          <p className="text-ivory/80">© 2024 Moku Moku House. All rights reserved.</p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
        }

        .animation-delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  );
};