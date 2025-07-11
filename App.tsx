import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import AnimatedSection from './components/AnimatedSection';
import ProjectCard from './components/ProjectCard';
import { ChevronDownIcon } from './components/icons/ChevronDownIcon';
import { GameControllerIcon } from './components/icons/GameControllerIcon';
import Blob from './components/Blob';
import { worksData, projectBorderColors, navLinks } from './constants';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('');
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.4,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    const currentRefs = sectionRefs.current;
    currentRefs.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => {
      currentRefs.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  const addToRefs = (el: HTMLElement | null, index: number) => {
    if (el && !sectionRefs.current.includes(el)) {
        sectionRefs.current[index] = el;
    }
  };


  return (
    <div className="bg-ivory text-coffee-dark font-sans">
      <Header activeSection={activeSection} />

      <main>
        {/* Hero Section */}
        <section id="home" className="h-screen w-full relative flex items-center justify-center">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://picsum.photos/seed/latteart/1920/1080')" }}
          ></div>
          <div className="absolute inset-0 bg-ivory/50 backdrop-blur-sm"></div>
          <div className="relative z-10 text-center text-coffee-dark px-4">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif mb-4 animate-fade-in-down">Welcome to Moku Moku House</h1>
            <p className="text-base sm:text-lg md:text-xl animate-fade-in-up" style={{ animationDelay: '0.5s' }}>クリエイターが静かに、もくもくと創作する場所</p>
          </div>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
            <ChevronDownIcon className="w-8 h-8 text-coffee-dark animate-bounce" />
          </div>
        </section>

        {/* About Section */}
        <section ref={el => addToRefs(el, 0)} id="about" className="py-20 md:py-32 bg-pastel-blue overflow-hidden relative">
          <Blob className="absolute top-0 left-0 w-full h-full opacity-30" />
          <AnimatedSection>
            <div className="container mx-auto px-6 text-center relative z-10">
              <div className="flex items-center justify-center mb-8">
                <div className="flex-grow border-t border-coffee-light"></div>
                <h2 className="text-3xl md:text-4xl font-serif mx-4 sm:mx-8">What is Moku Moku House?</h2>
                <div className="flex-grow border-t border-coffee-light"></div>
              </div>
              <p className="max-w-3xl mx-auto text-lg leading-relaxed">
                Moku Moku Houseは、デザイナー、イラストレーター、プログラマー、ライターなど、
                あらゆる分野のクリエイターが集うオンラインコミュニティです。
                まるで居心地の良いカフェにいるかのように、リラックスした雰囲気の中で、
                それぞれが「もくもくと」自分の創作活動に集中できる空間を目指しています。
              </p>
            </div>
          </AnimatedSection>
        </section>

        {/* Mokopi Section */}
        <section ref={el => addToRefs(el, 1)} id="mokopi" className="py-20 md:py-32 bg-ivory">
          <AnimatedSection>
            <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-x-12 gap-y-12">
              <div className="group relative w-72 h-80 cursor-pointer">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-vivid-pink to-vivid-green rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative p-2 bg-white rounded-lg shadow-lg transform -rotate-3 group-hover:rotate-0 transition-transform duration-300 ease-in-out">
                    <img
                        src="https://picsum.photos/seed/mokopi-normal/400/400"
                        alt="Mokopi normal face"
                        className="w-full h-full object-cover rounded-md group-hover:hidden"
                    />
                    <img
                        src="https://picsum.photos/seed/mokopi-wink/400/400"
                        alt="Mokopi winking face"
                        className="w-full h-full object-cover rounded-md hidden group-hover:block"
                    />
                  <div className="absolute bottom-4 left-4 font-serif text-coffee-dark text-xl">Mokopi</div>
                </div>
              </div>
              <div className="md:w-1/2 text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-serif mb-4">Our Mascot, Mokopi</h2>
                <p className="text-lg leading-relaxed">
                  コミュニティマスコットの「もこぴ」です。もこもこの羊で、みんなの創作活動を温かく見守ってくれます。ホバーするとウィンクしてくれる、ちょっとお茶目な一面も。
                </p>
              </div>
            </div>
          </AnimatedSection>
        </section>

        {/* Works Section */}
        <section ref={el => addToRefs(el, 2)} id="works" className="py-20 md:py-32 bg-pastel-blue overflow-hidden transform -skew-y-2">
           <div className="transform skew-y-2">
              <AnimatedSection>
                <div className="container mx-auto px-6">
                  <h2 className="text-3xl md:text-4xl font-serif text-center mb-12">Creator's Works</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {worksData.map((work, index) => (
                      <ProjectCard
                        key={work.id}
                        work={work}
                        borderColor={projectBorderColors[index % projectBorderColors.length]}
                      />
                    ))}
                  </div>
                </div>
              </AnimatedSection>
           </div>
        </section>

        {/* Game Section */}
        <section ref={el => addToRefs(el, 3)} id="game" className="py-20 md:py-32 bg-ivory">
          <AnimatedSection>
            <div className="container mx-auto px-6">
              <div className="max-w-2xl mx-auto p-8 md:p-12 border-2 border-dashed border-coffee-light rounded-lg flex flex-col items-center justify-center text-center">
                <GameControllerIcon className="w-16 h-16 text-coffee-light mb-6" />
                <h2 className="text-3xl md:text-4xl font-serif mb-4">A New Game is Coming Soon!</h2>
                <p className="text-lg">新しいミニゲームを準備中です！お楽しみに！</p>
              </div>
            </div>
          </AnimatedSection>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-coffee-mid text-ivory py-8 text-center">
        <div className="container mx-auto px-6">
          <p className="font-serif text-lg">Moku Moku House</p>
          <p className="text-sm mt-2">&copy; {new Date().getFullYear()} Moku Moku House. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
