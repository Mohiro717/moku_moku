import { ConvexReactClient } from "convex/react";

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;

// Check if we have a valid Convex URL (not the placeholder)
export const isConvexConfigured = CONVEX_URL && 
  !CONVEX_URL.includes('your-deployment') && 
  CONVEX_URL.startsWith('https://');

let convexClient: ConvexReactClient | null = null;

if (isConvexConfigured) {
  try {
    convexClient = new ConvexReactClient(CONVEX_URL);
  } catch (error) {
    console.warn('⚠️ Failed to initialize Convex client:', error);
  }
}

export const convex = convexClient;