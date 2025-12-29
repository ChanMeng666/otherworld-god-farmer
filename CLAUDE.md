# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Otherworld God-Farmer is a 2D farm simulation web game built with Angular 20 and Pixi.js 8. Players manage a farm using emoji-based visuals with mouse-first controls.

## Development Commands

### Frontend (Angular)
```bash
npm start          # Dev server at http://localhost:4200
npm run build      # Production build to dist/
npm run watch      # Watch mode development build
npm test           # Run tests with Karma/Jasmine
```

### Backend (Express)
```bash
cd server
npm run dev        # Dev server with hot reload (nodemon + ts-node)
npm run build      # Compile TypeScript to dist/
npm start          # Run compiled server (requires build first)
```

## Architecture

### State Management Pattern
Central state flows through `GameDataService` using RxJS BehaviorSubject:
- All game state lives in `ISaveData` interface (`src/app/models/save-data.model.ts`)
- Components subscribe to `getGameState()` observable
- Updates via partial update methods (`updatePlayerState`, `updateWorldData`, etc.)

### Rendering Pipeline
`GameCanvasComponent` (`src/app/game/game-canvas.component.ts`) is the core renderer:
- Initializes Pixi.js Application with 960x640 canvas
- Manages container hierarchy: gameContainer > worldContainer/buildingContainer/npcContainer
- Uses `EmojiRendererService` to convert emoji to Pixi textures (cached)
- Tile-based world: 30x20 grid, 32px tiles

### Service Layer (src/app/services/)
Each service is a singleton (`providedIn: 'root'`):
- `game-data.service.ts` - Central state store
- `world.service.ts` - Tile/terrain management, WorldData dictionary keyed by "x,y"
- `crop.service.ts` - Crop growth stages, planting, harvesting
- `building.service.ts` - Building placement and management
- `npc.service.ts` - NPC state and interactions
- `time.service.ts` - Game clock (minute/hour/day/season/year)
- `inventory.service.ts` - 20-slot player inventory
- `event.service.ts` - Random event system (weather, festivals)
- `save-game.service.ts` - Persistence via backend API
- `emoji-renderer.service.ts` - Emoji-to-texture conversion with caching
- `performance.service.ts` - FPS monitoring

### Backend API (server/src/)
Express server with save/load endpoints:
- `POST /api/save` - Save game data
- `GET /api/load/:userId` - Load save data
- Data stored as JSON files

## Key Models (src/app/models/)

- `ISaveData` - Complete game state snapshot
- `WorldData` - Dictionary of tile states keyed by "x,y" coordinate string
- `IPlayerState` - Position, stamina, movement state
- `IAllPurposeToolState` - Current tool, levels, abilities
- `ITimeState` - Game time (minute, hour, day, season, year)

## Game Systems

**Tools**: hoe, axe, pickaxe, watering_can, hammer, fishing_rod - each with level progression

**Crops**: 10 types with growth stages (seed > germination > growth > mature)

**Buildings**: house, barn, well, shop, workshop - placed on world grid

**Time**: Real-time progression affecting crop growth and events

## Testing

Frontend tests use Karma + Jasmine:
```bash
npm test                           # Run all tests
npx ng test --include=**/foo.spec.ts  # Run specific test file
```

## Build Notes

- Angular 20 standalone components (no NgModules)
- SCSS for styling
- Production budgets: 500kB warning, 1MB error for initial bundle
- Vercel deployment configured
