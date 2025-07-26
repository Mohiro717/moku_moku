import React, { useEffect, useState } from 'react';

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  rotation: number;
  type: 'star' | 'circle' | 'sparkle';
}

interface ParticleEffectProps {
  isActive: boolean;
  color: string;
  x: number;
  y: number;
  particleCount?: number;
}

export const ParticleEffect: React.FC<ParticleEffectProps> = ({
  isActive,
  color,
  x,
  y,
  particleCount = 8
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }

    const newParticles: Particle[] = [];
    const particleTypes: ('star' | 'circle' | 'sparkle')[] = ['star', 'circle', 'sparkle'];
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() * 0.5);
      const speed = 3 + Math.random() * 4;
      newParticles.push({
        id: `particle-${i}`,
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: color,
        size: 4 + Math.random() * 4,
        life: 1,
        maxLife: 1,
        rotation: Math.random() * 360,
        type: particleTypes[Math.floor(Math.random() * particleTypes.length)]
      });
    }
    setParticles(newParticles);

    const animateParticles = () => {
      setParticles(prev => {
        return prev
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vx: particle.vx * 0.98,
            vy: particle.vy + 0.2,
            life: particle.life - 0.015,
            size: particle.size * 0.99,
            rotation: particle.rotation + 5
          }))
          .filter(particle => particle.life > 0);
      });
    };

    const interval = setInterval(animateParticles, 16);
    return () => clearInterval(interval);
  }, [isActive, color, x, y, particleCount]);

  if (!isActive || particles.length === 0) return null;

  const renderParticle = (particle: Particle) => {
    const baseStyle = {
      left: `${particle.x}px`,
      top: `${particle.y}px`,
      opacity: particle.life,
      transform: `translate(-50%, -50%) rotate(${particle.rotation}deg)`,
      filter: 'brightness(1.5) saturate(1.3)',
      zIndex: 100
    };

    if (particle.type === 'star') {
      return (
        <div
          key={particle.id}
          className="absolute text-yellow-300 animate-pulse"
          style={{
            ...baseStyle,
            fontSize: `${particle.size}px`,
            textShadow: `0 0 ${particle.size}px ${particle.color}, 0 0 ${particle.size * 2}px #fff`
          }}
        >
          ✨
        </div>
      );
    }

    if (particle.type === 'sparkle') {
      return (
        <div
          key={particle.id}
          className="absolute"
          style={{
            ...baseStyle,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: `radial-gradient(circle, #fff 0%, ${particle.color} 50%, transparent 100%)`,
            borderRadius: '50%',
            boxShadow: `0 0 ${particle.size * 3}px ${particle.color}, 0 0 ${particle.size * 5}px #fff`
          }}
        />
      );
    }

    return (
      <div
        key={particle.id}
        className="absolute rounded-full"
        style={{
          ...baseStyle,
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          background: `radial-gradient(circle, #fff 20%, ${particle.color} 60%, transparent 100%)`,
          boxShadow: `0 0 ${particle.size * 2}px ${particle.color}, 0 0 ${particle.size * 4}px #fff, inset 0 0 ${particle.size}px rgba(255,255,255,0.5)`
        }}
      />
    );
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-50">
      {particles.map(renderParticle)}
    </div>
  );
};