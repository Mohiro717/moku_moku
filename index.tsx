import React from 'react';
import { createRoot } from 'react-dom/client';
import { ConvexProvider } from 'convex/react';
import { convex, isConvexConfigured } from './lib/convex';
import { App } from './App';
import { applyPerfLite } from './utils/perfLite';

applyPerfLite();

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    isConvexConfigured && convex ? (
      <ConvexProvider client={convex}>
        <App />
      </ConvexProvider>
    ) : (
      <App />
    )
  );
}