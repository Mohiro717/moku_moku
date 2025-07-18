import { useState } from 'react';

export const useInteraction = (initialState = false) => {
  const [isInteracted, setIsInteracted] = useState(initialState);

  const handleMouseEnter = () => setIsInteracted(true);
  const handleMouseLeave = () => setIsInteracted(false);
  const handleClick = () => setIsInteracted(!isInteracted);

  return {
    isInteracted,
    handleMouseEnter,
    handleMouseLeave,
    handleClick
  };
};