import React from 'react';
import { SITE_CONFIG } from '../constants';

export const Footer: React.FC = () => {
  return (
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
  );
};