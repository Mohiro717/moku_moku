import React, { useRef, useState, useCallback } from 'react';

interface TouchControlsProps {
  onMove: (direction: 'left' | 'right' | 'down') => void;
  onRotate: () => void;
  onHardDrop: () => void;
  isActive: boolean;
  children: React.ReactNode;
}

interface TouchData {
  startX: number;
  startY: number;
  startTime: number;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMove,
  onRotate,
  onHardDrop,
  isActive,
  children
}) => {
  const touchData = useRef<TouchData | null>(null);
  const [touchFeedback, setTouchFeedback] = useState<string | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isActive) return;
    
    const touch = e.touches[0];
    touchData.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now()
    };
    
    e.preventDefault();
  }, [isActive]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isActive || !touchData.current) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchData.current.startX;
    const deltaY = touch.clientY - touchData.current.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Only process if moved enough distance
    if (distance > 20) {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      
      if (absX > absY) {
        // Horizontal movement
        if (deltaX > 0) {
          onMove('right');
          setTouchFeedback('→');
        } else {
          onMove('left');
          setTouchFeedback('←');
        }
      } else if (deltaY > 0) {
        // Vertical movement (downward)
        onMove('down');
        setTouchFeedback('↓');
      }
      
      // Reset touch data to prevent repeated calls
      touchData.current = {
        ...touchData.current,
        startX: touch.clientX,
        startY: touch.clientY
      };
    }
    
    e.preventDefault();
  }, [isActive, onMove]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isActive || !touchData.current) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchData.current.startX;
    const deltaY = touch.clientY - touchData.current.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = Date.now() - touchData.current.startTime;
    
    // Check for different gesture types
    if (distance < 10 && duration < 200) {
      // Tap gesture - rotate (stricter detection)
      onRotate();
      setTouchFeedback('↻');
    } else if (deltaY > 50 && duration < 200) {
      // Quick downward flick - hard drop
      onHardDrop();
      setTouchFeedback('⬇');
    }
    
    // Clear touch data
    touchData.current = null;
    
    // Clear feedback after animation
    setTimeout(() => setTouchFeedback(null), 300);
    
    e.preventDefault();
  }, [isActive, onRotate, onHardDrop]);

  return (
    <div className="relative">
      {/* Touch overlay */}
      {isActive && (
        <div
          className="absolute inset-0 z-10 bg-transparent"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: 'none' }}
        />
      )}
      
      {/* Game content */}
      {children}
      
      
    </div>
  );
};