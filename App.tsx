import React, { useState } from 'react';
import { Header } from './components/Header';
import { LoadingScreen } from './components/LoadingScreen';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { MocopiSection } from './components/MocopiSection';
import { WorksSection } from './components/WorksSection';
import { GameSection } from './components/GameSection';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  const scrollToNext = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <LoadingScreen isLoading={isLoading} onComplete={handleLoadingComplete} />
      {!isLoading && (
        <div className="min-h-screen">
          <Header />
          <HeroSection onScrollToNext={scrollToNext} />
          <AboutSection />
          <MocopiSection />
          <WorksSection />
          <GameSection />
          <Footer />
        </div>
      )}
    </>
  );
};