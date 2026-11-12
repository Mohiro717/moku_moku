import React, { useState } from 'react';
import { Header } from './components/Header';
import { LoadingScreen } from './components/LoadingScreen';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { MocopiSection } from './components/MocopiSection';
import { WorksSection } from './components/WorksSection';
import { GameSection } from './components/GameSection';
import { Footer } from './components/Footer';
import { PuyoLookSheet } from './components/game/PuyoLookSheet';

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

  // 【見比べ用・開発のみ】ぷよの質感の案。案を決めたら消す
  if (import.meta.env.DEV && new URLSearchParams(location.search).has('puyosheet')) return <PuyoLookSheet />;

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