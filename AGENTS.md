# AGENTS.md — One Piece Card Game Deck Recommender

## Project Overview

원피스 카드 게임 덱 추천 웹사이트. 간단한 질의응답/선택을 통해 사용자에게 맞는 덱 또는 덱 타입을 추천한다.
덱 추천 범위는 **11탄(OP-11)까지**의 공식 카드셋 기준.

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Data**: Static JSON files (no backend DB)
- **Package Manager**: pnpm

---

## Build / Lint / Test Commands

```bash
# Install dependencies
pnpm install

# Development server
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Lint
pnpm lint              # ESLint
pnpm lint --fix        # ESLint with auto-fix

# Type check
pnpm tsc --noEmit

# Test (Vitest)
pnpm test              # Run all tests
pnpm test -- run       # Run once (no watch)
pnpm test -- <path>    # Run single test file (e.g. pnpm test -- src/lib/recommend.test.ts)
pnpm test -- -t "test name"  # Run single test by name

# Format
pnpm prettier --write .
pnpm prettier --check .
```

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home / landing page
│   ├── quiz/               # Quiz flow pages
│   └── result/             # Deck recommendation results
├── components/             # Shared React components
│   ├── ui/                 # Primitives (Button, Card, etc.)
│   └── quiz/               # Quiz-specific components
├── data/                   # Static JSON data
│   ├── decks.json          # Deck definitions (리더, 컬러, 전략 등)
│   ├── leaders.json        # Leader card data
│   └── questions.json      # Quiz questions and answer mappings
├── lib/                    # Business logic (pure functions)
│   ├── recommend.ts        # Deck recommendation engine
│   ├── scoring.ts          # Answer → deck scoring logic
│   └── types.ts            # Shared TypeScript types
├── hooks/                  # Custom React hooks
└── styles/                 # Global styles (Tailwind config)
```

---

## Code Style

### TypeScript

- **Strict mode ON** (`"strict": true` in tsconfig.json)
- NO `any` — use `unknown` + type narrowing if type is uncertain
- NO `@ts-ignore` or `@ts-expect-error` — fix the type issue properly
- NO non-null assertions (`!`) — use proper null checks
- Prefer `interface` for object shapes, `type` for unions/intersections
- Export types from `src/lib/types.ts` — single source of truth

```typescript
// ✅ Good
interface Deck {
  id: string;
  name: string;
  leader: Leader;
  colors: Color[];
  playstyle: Playstyle[];
  tier: Tier;
  difficulty: Difficulty;
  description: string;
}

type Color = "Red" | "Green" | "Blue" | "Purple" | "Black" | "Yellow";
type Playstyle = "aggro" | "midrange" | "control" | "combo";
type Tier = "S" | "A" | "B" | "C";
type Difficulty = "easy" | "medium" | "hard";

// ❌ Bad
const deck: any = fetchDeck();
const name = deck!.name;
```

### Imports

- Use path aliases: `@/` maps to `src/`
- Order: (1) external packages → (2) `@/lib` → (3) `@/components` → (4) `@/data` → (5) relative
- NO circular imports between modules

```typescript
import { useState } from "react";
import { type Deck } from "@/lib/types";
import { recommendDecks } from "@/lib/recommend";
import { Button } from "@/components/ui/Button";
import decksData from "@/data/decks.json";
```

### Naming Conventions

| Kind              | Convention       | Example                        |
|-------------------|------------------|--------------------------------|
| Components        | PascalCase       | `DeckCard.tsx`, `QuizStep.tsx` |
| Hooks             | camelCase + use  | `useQuizState.ts`              |
| Utilities / lib   | camelCase        | `recommend.ts`, `scoring.ts`   |
| Types / Interfaces| PascalCase       | `Deck`, `QuizAnswer`           |
| Constants         | SCREAMING_SNAKE  | `MAX_RECOMMENDATIONS`          |
| JSON data files   | kebab-case       | `decks.json`, `leaders.json`   |
| CSS classes       | Tailwind utility | `className="flex items-center"`|
| Route segments    | kebab-case       | `app/quiz-result/page.tsx`     |

### React Components

- **Function components only** — no class components
- **Named exports** — no default exports (except Next.js pages which require it)
- Props interface defined inline or co-located with component
- Server Components by default. Add `"use client"` only when interactive state/effects needed

```typescript
// src/components/ui/DeckCard.tsx
interface DeckCardProps {
  deck: Deck;
  onSelect?: (deckId: string) => void;
}

export function DeckCard({ deck, onSelect }: DeckCardProps) {
  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <h3 className="text-lg font-bold">{deck.name}</h3>
      <p className="text-sm text-gray-600">{deck.description}</p>
    </div>
  );
}
```

### Error Handling

- Never use empty `catch {}` — always handle or log
- Use `Error` subclasses for domain errors
- Pages should have `error.tsx` boundary for graceful degradation

### Data / JSON Files

- All deck and card data lives in `src/data/` as typed JSON
- JSON files must have corresponding TypeScript type definitions in `src/lib/types.ts`
- Data is imported statically — no runtime fetch for deck info
- Keep data normalized: decks reference leader IDs, not full leader objects

### Testing

- Test framework: **Vitest**
- Test files: co-located as `*.test.ts` / `*.test.tsx` next to source
- Focus tests on `src/lib/` — recommendation logic must be well-tested
- Use descriptive test names in Korean or English (either is fine, be consistent per file)

```typescript
// src/lib/recommend.test.ts
import { describe, it, expect } from "vitest";
import { recommendDecks } from "./recommend";

describe("recommendDecks", () => {
  it("should return aggro decks for aggressive playstyle preference", () => {
    const result = recommendDecks({ playstyle: "aggro", experience: "beginner" });
    expect(result.every((d) => d.playstyle.includes("aggro"))).toBe(true);
  });
});
```

---

## Key Design Decisions

1. **No backend** — static JSON + client-side logic. Deploy as static site or SSG.
2. **Quiz-based UX** — multi-step form collecting user preferences (playstyle, difficulty, favorite color, etc.)
3. **Scoring engine** — each answer maps to weighted scores per deck attribute. Final recommendation = highest scoring decks.
4. **Korean-first UI** — UI text in Korean. Code (variables, comments, docs) in English.
5. **Responsive** — mobile-first. Most users will access on mobile.

---

## Domain Context (원피스 카드 게임)

- Each deck is built around a **Leader** card that defines the deck's color identity
- Colors: Red, Green, Blue, Purple, Black, Yellow (+ multi-color leaders)
- Playstyles: aggro (빠른 공격), midrange (밸런스), control (방어/후반), combo (시너지 콤보)
- Set range: OP-01 through OP-11 (스타터덱 포함)
- Tier ratings reflect the current meta as of OP-11

---

## Do NOT

- Add a database or auth system — this is a static recommendation tool
- Use `any` type or suppress TypeScript errors
- Fetch deck data from external APIs at runtime — use static imports
- Add i18n complexity — Korean-only UI is fine
- Over-engineer: this is a focused, single-purpose tool
