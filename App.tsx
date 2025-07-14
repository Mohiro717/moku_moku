import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { AnimatedSection } from './components/AnimatedSection';
import { Blob } from './components/Blob';
import { ProjectCard } from './components/ProjectCard';
import { SectionTitle } from './components/SectionTitle';
import { ChevronDownIcon } from './components/icons/ChevronDownIcon';
import { GameControllerIcon } from './components/icons/GameControllerIcon';
import { SITE_CONFIG, SAMPLE_WORKS } from './constants';

export const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [mokopiInteracted, setMokopiInteracted] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'mokopi', 'works', 'game'];
      const scrollPosition = window.scrollY + 120;

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

  const handleMokopiInteraction = () => {
    setMokopiInteracted(!mokopiInteracted);
  };

  return (
    <div className="min-h-screen">
      <Header activeSection={activeSection} />

      {/* Hero Section */}
      <section 
        id="home" 
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-ivory via-pastel-blue/20 to-coffee-light/30" />
        <div className="absolute inset-0 bg-ivory/40 backdrop-blur-sm" />
        
        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-coffee-dark mb-6 opacity-0 animate-fade-in-up">
            {SITE_CONFIG.heroTitle}
          </h1>
          <p 
            className="text-xl md:text-2xl text-coffee-mid mb-8 opacity-0 animate-fade-in-up leading-relaxed"
            style={{ animationDelay: '0.5s' }}
          >
            {SITE_CONFIG.heroSubtitle}
          </p>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={scrollToNext}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-coffee-dark/60 hover:text-vivid-pink transition-colors duration-300 animate-bounce-slow"
          aria-label="下にスクロール"
        >
          <ChevronDownIcon className="w-8 h-8" />
        </button>
      </section>

      {/* About Section */}
      <section className="relative py-20 lg:py-32 bg-pastel-blue overflow-hidden">
        <Blob />
        {/* Bottom slanted edge */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg className="relative block w-full h-20" viewBox="0 0 1200 100" preserveAspectRatio="none">
            <polygon fill="#f8f4e9" points="0,100 1200,100 1200,0 0,60"></polygon>
          </svg>
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <AnimatedSection id="about" className="text-center">
            <SectionTitle className="mb-12">
              {SITE_CONFIG.aboutTitle}
            </SectionTitle>
            
            <div className="max-w-4xl mx-auto">
              {SITE_CONFIG.aboutDescription.split('\n\n').map((paragraph, index) => (
                <p 
                  key={index}
                  className="text-lg md:text-xl text-coffee-dark/80 leading-relaxed mb-6 last:mb-0"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Mokopi Section */}
      <section className="py-20 lg:py-32 bg-ivory">
        <div className="max-w-6xl mx-auto px-4">
          <AnimatedSection id="mokopi">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Content */}
              <div className="text-center lg:text-left order-2 lg:order-1">
                <SectionTitle showLines={false} className="mb-6 lg:text-left text-5xl md:text-6xl">
                  {SITE_CONFIG.mokopiTitle}
                </SectionTitle>
                <div className="space-y-4">
                  {SITE_CONFIG.mokopiDescription.split('\n\n').map((paragraph, index) => (
                    <p 
                      key={index}
                      className="text-lg text-coffee-dark/80 leading-relaxed"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* Mokopi Character */}
              <div className="text-center order-1 lg:order-2">
                <div
                  className={`relative inline-block transition-all duration-500 cursor-pointer ${
                    mokopiInteracted ? 'transform rotate-0' : 'transform rotate-2'
                  }`}
                  onMouseEnter={() => setMokopiInteracted(true)}
                  onMouseLeave={() => setMokopiInteracted(false)}
                  onClick={handleMokopiInteraction}
                >
                  {/* Glow effect */}
                  <div
                    className={`absolute inset-0 rounded-2xl transition-all duration-500 pointer-events-none ${
                      mokopiInteracted 
                        ? 'bg-gradient-to-br from-vivid-pink/40 to-vivid-green/40 blur-xl scale-110' 
                        : 'bg-gradient-to-br from-vivid-pink/20 to-vivid-green/20 blur-lg scale-105'
                    }`}
                  />
                  
                  {/* Card */}
                  <div className="relative bg-white rounded-2xl p-8 lg:p-12 shadow-lg">
                    <div className="w-48 h-48 lg:w-56 lg:h-56 mx-auto bg-gradient-to-br from-vivid-pink/10 to-vivid-green/10 rounded-full flex items-center justify-center mb-6">
                      <span className="text-7xl lg:text-8xl transition-all duration-300">
                        {mokopiInteracted ? '😉' : '😊'}
                      </span>
                    </div>
                    <h3 className="font-serif text-2xl lg:text-3xl font-bold text-coffee-dark">
                      Mokopi
                    </h3>
                    <p className="text-coffee-mid/70 mt-2">
                      Moku Moku House Mascot
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Works Section */}
      <section className="py-20 lg:py-32 bg-pastel-blue transform skew-y-2">
        <div className="max-w-7xl mx-auto px-4 transform -skew-y-2">
          <AnimatedSection id="works" className="text-center mb-16">
            <SectionTitle className="mb-4" lineLength="long">
              {SITE_CONFIG.worksTitle}
            </SectionTitle>
            <p className="text-lg text-coffee-dark/70 max-w-2xl mx-auto">
              Moku Moku Houseのクリエイターたちによる素晴らしい作品をご紹介します
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {SAMPLE_WORKS.map((work, index) => (
                <ProjectCard key={work.id} work={work} index={index} />
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Game Section */}
      <section className="py-20 lg:py-32 bg-ivory">
        <div className="max-w-4xl mx-auto px-4">
          <AnimatedSection id="game" className="text-center">
            <div className="border-2 border-dashed border-coffee-light rounded-3xl p-12 lg:p-16">
              <GameControllerIcon className="w-16 h-16 lg:w-20 lg:h-20 mx-auto text-coffee-light mb-8" />
              <SectionTitle showLines={false} className="mb-4 text-3xl md:text-4xl lg:text-5xl">
                {SITE_CONFIG.gameTitle}
              </SectionTitle>
              <p className="text-lg lg:text-xl text-coffee-dark/70 leading-relaxed">
                {SITE_CONFIG.gameDescription}
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-coffee-mid text-ivory py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="font-serif text-2xl lg:text-3xl font-bold mb-4">
            {SITE_CONFIG.title}
          </h3>
          <p className="text-ivory/80 mb-4">
            クリエイターが静かに、もくもくと創作する場所
          </p>
          <p className="text-ivory/60 text-sm">
            © 2024 Moku Moku House. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};