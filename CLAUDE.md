# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Development Principles

All development in this project follows these fundamental principles:

### YAGNI (You Aren't Gonna Need It)
- 今必要じゃない機能は作らない
- Only implement features that are immediately required
- Avoid over-engineering and speculative features
- Build incrementally based on actual needs

### DRY (Don't Repeat Yourself)
- 同じコードを繰り返さない
- Extract common functionality into reusable components/utilities
- Create shared constants for repeated values
- Use composition over duplication

### KISS (Keep It Simple, Stupid)
- シンプルに保つ
- Choose simple solutions over complex ones
- Write readable, self-documenting code
- Avoid unnecessary abstractions

## Implementation Guidelines

When working on this project:

1. **Before adding new features**: Ask if it's needed now (YAGNI)
2. **Before writing code**: Check if similar code exists (DRY)
3. **When designing solutions**: Choose the simplest approach (KISS)

## Development Commands

This is a React/TypeScript application built with Vite:

- `npm run dev` - Start development server on port 3000 with auto-open
- `npm run build` - Build for production to `dist/` directory
- `npm run preview` - Preview production build locally

The application deploys to the `/moku_moku/` base path (configured in vite.config.ts).

## Project Architecture

### Application Structure
Moku Moku House is a portfolio/showcase website with a Japanese theme, featuring:
- Multi-section layout: Hero, About, Mocopi mascot, Fortnite creators showcase, and embedded Puyo Puyo game
- Component-driven architecture with TypeScript throughout
- Custom styling using Tailwind-like utilities in common.ts

### Key Directories
- `/components/` - All React components organized by feature
  - `/game/` - Complete Puyo Puyo game implementation
  - `/icons/` - Custom SVG icon components
  - `/ui/` - Reusable UI components
- `/hooks/` - Custom React hooks, heavily focused on game logic
- `/utils/` - Pure utility functions for game mechanics
- `/types/` - TypeScript type definitions
- `/styles/` - Styling utilities and theme constants

### Game System Architecture
The embedded Puyo Puyo game follows a sophisticated hook-based architecture:

**Core Game Hooks:**
- `useGameCore.ts` - Main game state management
- `useGameLoop.ts` - Animation frame game loop
- `useGameInput.ts` - Keyboard/touch input handling
- `useGameMovement.ts` - Piece movement and collision detection
- `useGameChain.ts` - Chain reaction processing

**Game Logic Utils:**
- `puyoGameLogic.ts` - Core game mechanics (grid management, chain detection, scoring)
- `puyoKickSystem.ts` - Advanced rotation system with wall/floor kicks

**Game State Management:**
The game uses a centralized state pattern with multiple specialized hooks that communicate through a shared game state. The architecture separates concerns between input handling, game logic, rendering, and animation timing.

### Component Patterns
- Most components are functional with TypeScript interfaces
- Error boundaries wrap the game components
- Animated sections use intersection observer for scroll-triggered animations
- Responsive design with mobile-first approach

### Data Management
- Static data in `constants.ts` (Fortnite creators, theme colors, site content)
- Game configuration centralized in `puyoGameLogic.ts`
- Type-safe interfaces for all data structures

### Styling Approach
- Custom color theme (ivory, coffee tones) defined in constants
- Utility-first styling with reusable functions in `styles/common.ts`
- Responsive grid layouts for different sections
- Japanese typography considerations

The codebase emphasizes clean separation of concerns, type safety, and modular architecture suitable for both portfolio content and interactive game features.