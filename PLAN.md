# Implementation Plan: 원피스 카드 게임 덱 추천 웹사이트

## 1. Overview

| Item | Value |
|------|-------|
| Project | One Piece Card Game Deck Recommender |
| Stack | Next.js 15 (App Router), TypeScript (strict), Tailwind CSS v4, Vitest, pnpm |
| Data | Static JSON — 18 decks, 18 leaders, 5 quiz questions |
| Output | Top 3 recommended decks + expandable full ranking |
| UI Language | Korean |
| Code Language | English |
| Target | Mobile-first responsive web |

---

## 2. Architecture

```
src/
├── app/
│   ├── layout.tsx              # Root layout (Server Component)
│   ├── page.tsx                # Home / landing page (Server Component)
│   ├── error.tsx               # Global error boundary (Client Component)
│   ├── not-found.tsx           # 404 page (Server Component)
│   ├── globals.css             # Tailwind v4 CSS-first config + theme tokens
│   ├── quiz/
│   │   └── page.tsx            # Quiz flow (Client Component)
│   └── result/
│       └── page.tsx            # Recommendation results (Client Component)
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── ProgressBar.tsx
│   │   └── Badge.tsx
│   ├── quiz/
│   │   ├── QuizOption.tsx
│   │   └── QuizStep.tsx
│   └── DeckCard.tsx
├── data/
│   ├── decks.json              # 18 deck definitions
│   ├── leaders.json            # 18 leader cards
│   └── questions.json          # 5 quiz questions + scoring weights
├── lib/
│   ├── types.ts                # All domain types (single source of truth)
│   ├── scoring.ts              # Answer → weighted score calculation
│   ├── recommend.ts            # Score → deck ranking + match reasons
│   ├── scoring.test.ts         # Scoring unit tests
│   └── recommend.test.ts       # Recommendation unit tests
├── hooks/
│   └── useQuizState.ts         # Quiz state management hook
└── test/
    └── setup.ts                # Vitest setup (@testing-library/jest-dom)
```

---

## 3. Wave Structure & Dependency Graph

```
Wave 1: Project Scaffolding ──────────── [Task 1]
            │
            ▼
Wave 2: Type System & Data ──────────── [Task 2]
            │
       ┌────┴────┐
       ▼         ▼
Wave 3: [Task 3] ∥ [Task 4]  ← PARALLEL
       (Logic)    (UI)
       └────┬────┘
            │
       ┌────┴────┐
       ▼         ▼
Wave 4: [Task 5] ∥ [Task 6]  ← PARALLEL
       (Home)    (Quiz+Result)
       └────┬────┘
            │
            ▼
Wave 5: Integration & QA ───────────── [Task 7]
```

| Wave | Tasks | Parallel? | Est. Time |
|------|-------|-----------|-----------|
| Wave 1 | Task 1 | — | 15-20 min |
| Wave 2 | Task 2 | — | 30-40 min |
| Wave 3 | Task 3 + Task 4 | Yes | 30-40 min |
| Wave 4 | Task 5 + Task 6 | Yes | 30-40 min |
| Wave 5 | Task 7 | — | 20-30 min |
| **Total** | **7 tasks** | | **~2.5-3 hours** |

---

## 4. Task Details

---

### Wave 1 — Project Scaffolding

#### Task 1: Initialize Next.js 15 Project & Tooling

**Category**: `quick`
**Estimated time**: 15-20 min

**Steps (in order)**:

1. Initialize Next.js 15:
   ```bash
   pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm
   ```

2. Initialize git:
   ```bash
   git init && git add -A && git commit -m "chore: initialize Next.js 15 project"
   ```

3. Install dev dependencies:
   ```bash
   pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom vite-tsconfig-paths prettier eslint-config-prettier
   ```

4. Create/modify configuration files (see details below)

5. Remove boilerplate from `src/app/page.tsx` (replace with minimal placeholder)

6. Verify everything works:
   ```bash
   pnpm dev          # starts without error
   pnpm build        # production build succeeds
   pnpm lint         # no lint errors
   pnpm tsc --noEmit # no type errors
   pnpm test -- run  # 0 tests, no errors
   ```

**Files to create**:

| File | Action |
|------|--------|
| `vitest.config.mts` | **Create** |
| `src/test/setup.ts` | **Create** |
| `.prettierrc` | **Create** |
| `.prettierignore` | **Create** |

**Files to modify**:

| File | Action |
|------|--------|
| `package.json` | Add `test`, `test:run`, `tsc`, `format`, `format:check` scripts |
| `eslint.config.mjs` | Add `eslint-config-prettier/flat` at the end |
| `src/app/globals.css` | Replace with Tailwind v4 `@import "tailwindcss"` + `@theme` block |
| `src/app/page.tsx` | Strip boilerplate, minimal placeholder |
| `src/app/layout.tsx` | Minimal — keep metadata, strip extra styling |
| `tsconfig.json` | Verify `strict: true` is present |

**Configuration file contents**:

`vitest.config.mts`:
```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next"],
  },
});
```

`src/test/setup.ts`:
```typescript
import "@testing-library/jest-dom";
```

`package.json` scripts section:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "lint:fix": "eslint --fix",
    "test": "vitest",
    "test:run": "vitest run",
    "tsc": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

`.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

`.prettierignore`:
```
.next/
node_modules/
out/
build/
public/
pnpm-lock.yaml
```

`eslint.config.mjs` — append `prettier` as last config:
```javascript
// After existing next configs...
import prettier from "eslint-config-prettier/flat";
// Add prettier to the config array (must be LAST)
```

`src/app/globals.css`:
```css
@import "tailwindcss";

@theme {
  --color-op-red: #e74c3c;
  --color-op-green: #27ae60;
  --color-op-blue: #2980b9;
  --color-op-purple: #8e44ad;
  --color-op-black: #2c3e50;
  --color-op-yellow: #f39c12;

  --color-tier-s: #ff6b6b;
  --color-tier-a: #ffa502;
  --color-tier-b: #7bed9f;
  --color-tier-c: #70a1ff;
}
```

**Acceptance criteria**:
- [ ] All 6 verification commands pass
- [ ] Git initialized with first commit
- [ ] `@/` path alias resolves in both Next.js and Vitest
- [ ] Tailwind v4 CSS-first config active (no `tailwind.config.js`)
- [ ] ESLint + Prettier do not conflict

---

### Wave 2 — Type System & Static Data

#### Task 2: TypeScript Types + JSON Data Files

**Category**: `unspecified-high`
**Dependencies**: Task 1 completed
**Estimated time**: 30-40 min

**Files to create**:

| File | Description |
|------|-------------|
| `src/lib/types.ts` | All domain type definitions |
| `src/data/leaders.json` | 18 leader cards |
| `src/data/decks.json` | 18 deck definitions |
| `src/data/questions.json` | 5 quiz questions with scoring weights |

**Context to provide**: Full type definitions (Section 5), full deck data (Section 6), full quiz data (Section 7)

**Acceptance criteria**:
- [ ] `pnpm tsc --noEmit` passes
- [ ] `leaders.json` contains exactly 18 leaders
- [ ] `decks.json` contains exactly 18 decks
- [ ] `questions.json` contains exactly 5 questions
- [ ] Every `deck.leaderId` in `decks.json` has a matching entry in `leaders.json`
- [ ] All JSON data conforms to TypeScript types (static import works without errors)
- [ ] No `any` types anywhere

---

### Wave 3 — Business Logic & UI Components (PARALLEL)

#### Task 3: Scoring Engine + Recommendation Logic + Tests

**Category**: `ultrabrain`
**Dependencies**: Task 2 completed
**Parallel with**: Task 4
**Estimated time**: 30-40 min

**Files to create**:

| File | Description |
|------|-------------|
| `src/lib/scoring.ts` | `aggregateWeights()`, `calculateDeckScore()` |
| `src/lib/recommend.ts` | `recommendDecks()`, `generateMatchReasons()` |
| `src/lib/scoring.test.ts` | Scoring unit tests (6+ test cases) |
| `src/lib/recommend.test.ts` | Recommendation unit tests (6+ test cases) |

**Function signatures**:

```typescript
// scoring.ts
export function aggregateWeights(
  answers: Record<string, string>,
  questions: QuizQuestion[],
): AggregatedWeights;

export function calculateDeckScore(
  deck: Deck,
  weights: AggregatedWeights,
): number;

// recommend.ts
export function recommendDecks(
  answers: Record<string, string>,
): DeckRecommendation[];

export function generateMatchReasons(
  deck: Deck,
  weights: AggregatedWeights,
): string[];
```

**Required test cases**:

`scoring.test.ts`:
- Single answer weight aggregation is correct
- Multiple answers accumulate weights properly
- Color scores calculated correctly for matching decks
- Playstyle scores calculated correctly for matching decks
- Tier and difficulty scores calculated correctly
- Empty/missing answers handled gracefully (no crash)

`recommend.test.ts`:
- Aggro preference → aggro decks rank highest
- Beginner + easy preference → easy decks prioritized
- Specific color preference → matching color decks score higher
- Competitive goal → S/A tier decks prioritized
- Always returns exactly 3 top recommendations
- Results include non-empty matchReasons
- Results are deterministic (same input → same output)
- Full ranking (all 18 decks) is available

**Acceptance criteria**:
- [ ] `pnpm test -- run` — all tests green
- [ ] `pnpm tsc --noEmit` passes
- [ ] Functions are pure (no side effects, deterministic)
- [ ] `recommendDecks()` returns top 3 + full sorted ranking

---

#### Task 4: UI Components + Quiz Components + Hook

**Category**: `visual-engineering`
**Skills**: `frontend-ui-ux`
**Dependencies**: Task 2 completed
**Parallel with**: Task 3
**Estimated time**: 30-40 min

**Files to create**:

| File | Client? | Description |
|------|---------|-------------|
| `src/components/ui/Button.tsx` | Yes | Variant: `primary` / `secondary` / `ghost`. Size: `sm` / `md` / `lg` |
| `src/components/ui/Card.tsx` | No | Wrapper with padding/border/shadow. `children` prop |
| `src/components/ui/ProgressBar.tsx` | Yes | `current: number`, `total: number`. Animated transition |
| `src/components/ui/Badge.tsx` | No | Color variant (6 OP colors) + Tier variant (S/A/B/C) |
| `src/components/quiz/QuizOption.tsx` | Yes | Single answer option. `selected` state, `onClick`, icon + text |
| `src/components/quiz/QuizStep.tsx` | Yes | One question: title + description + options list. Fade/slide transition |
| `src/components/DeckCard.tsx` | No | Deck result card: name, leader, color badges, tier badge, playstyle, difficulty, matchReasons, rank |
| `src/hooks/useQuizState.ts` | — | Quiz state management hook |

**Component specifications**:

`Button`:
```typescript
interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}
```
- Touch target minimum 44px on mobile
- `primary` = filled, brand color
- `secondary` = outlined
- `ghost` = text-only

`ProgressBar`:
```typescript
interface ProgressBarProps {
  current: number;
  total: number;
}
```
- Width percentage = `(current / total) * 100`
- Smooth CSS transition on width change
- Shows step indicator text: "2 / 5"

`Badge`:
```typescript
interface BadgeProps {
  variant: "color" | "tier" | "difficulty" | "playstyle";
  value: string;
}
```
- Color badge: background matches OP color (Red → op-red, etc.)
- Tier badge: S=red, A=orange, B=green, C=blue
- Small, pill-shaped

`QuizOption`:
```typescript
interface QuizOptionProps {
  option: QuizOption;
  selected: boolean;
  onClick: () => void;
}
```
- Unselected: bordered, hover effect
- Selected: filled background, check indicator
- Icon (emoji) on the left, text on the right

`QuizStep`:
```typescript
interface QuizStepProps {
  question: QuizQuestion;
  selectedOptionId: string | null;
  onSelectOption: (optionId: string) => void;
}
```
- Question text prominently displayed
- Description text below (smaller, muted)
- Options rendered as a vertical list (mobile) or grid (desktop)

`DeckCard`:
```typescript
interface DeckCardProps {
  recommendation: DeckRecommendation;
  rank: number;
  leader: Leader;
}
```
- Rank indicator (1st/2nd/3rd or 순위)
- Deck name (Korean) + leader name
- Color badges row
- Tier badge + difficulty badge + playstyle badges
- Match reasons list
- Card has subtle elevation, slightly larger for rank 1

`useQuizState` hook:
```typescript
interface UseQuizStateReturn {
  currentStep: number;       // 0-indexed
  totalSteps: number;        // 5
  currentQuestion: QuizQuestion;
  answers: Record<string, string>;  // questionId → optionId
  selectedOptionId: string | null;  // current step's selected option
  isComplete: boolean;
  progress: number;          // 0-100 percentage
  selectAnswer: (questionId: string, optionId: string) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  canGoNext: boolean;        // true if current step has an answer
  canGoPrevious: boolean;    // true if not on first step
  reset: () => void;
}
```
- State managed with `useReducer` or `useState`
- Loads questions from `@/data/questions.json`
- `goToNextStep` on last step sets `isComplete = true`

**Acceptance criteria**:
- [ ] `pnpm tsc --noEmit` passes
- [ ] All components use named exports
- [ ] `"use client"` only on components that need state/effects (Button, ProgressBar, QuizOption, QuizStep)
- [ ] Card, Badge, DeckCard are Server Components (no `"use client"`)
- [ ] Touch targets >= 44px on interactive elements
- [ ] Mobile-first: components look good on 375px width

---

### Wave 4 — Pages & Routing (PARALLEL)

#### Task 5: Home Page + Root Layout

**Category**: `visual-engineering`
**Skills**: `frontend-ui-ux`
**Dependencies**: Task 3 + Task 4 completed
**Parallel with**: Task 6
**Estimated time**: 15-20 min

**Files to modify**:

| File | Description |
|------|-------------|
| `src/app/layout.tsx` | Root layout: metadata, font, global structure |
| `src/app/page.tsx` | Home/landing page |
| `src/app/globals.css` | Final theme tokens if needed |

**Root layout** (`src/app/layout.tsx`):
- `metadata`: title="원피스 카드 게임 덱 추천", description, og tags
- Font: System font stack (or Google Font: Noto Sans KR)
- Minimal header: site name/logo text
- Minimal footer: credit text
- Server Component (no `"use client"`)

**Home page** (`src/app/page.tsx`):
- Hero section:
  - Title: "나에게 맞는 원피스 카드 게임 덱은?"
  - Subtitle: "5개 질문에 답하면 당신에게 딱 맞는 덱을 추천해 드려요!"
  - CTA button → Link to `/quiz`
- Brief feature highlights (optional, 3 icons+text):
  - "5가지 간단한 질문"
  - "18개 메타 덱 분석"
  - "OP-11 최신 메타 반영"
- Server Component (static, no client interactivity)

**Acceptance criteria**:
- [ ] `/` renders correctly with CTA link to `/quiz`
- [ ] Metadata (title, description) set correctly
- [ ] Mobile layout (375px) looks good
- [ ] No `"use client"` on these files

---

#### Task 6: Quiz Page + Result Page + Error Boundaries

**Category**: `visual-engineering`
**Skills**: `frontend-ui-ux`
**Dependencies**: Task 3 + Task 4 completed
**Parallel with**: Task 5
**Estimated time**: 30-40 min

**Files to create**:

| File | Description |
|------|-------------|
| `src/app/quiz/page.tsx` | Quiz flow — Client Component |
| `src/app/result/page.tsx` | Recommendation results — Client Component |
| `src/app/error.tsx` | Global error boundary — Client Component |
| `src/app/not-found.tsx` | 404 page — Server Component |

**Quiz page** (`"use client"`):
```
Flow:
1. User arrives → first question displayed
2. User selects an option → option highlighted
3. User clicks "다음" → next question (slide transition)
4. User can click "이전" → previous question
5. ProgressBar updates at each step
6. On final question → "결과 보기" button
7. Click → navigate to /result?a=<encoded-answers>
```

- Uses `useQuizState` hook
- Uses `QuizStep` + `ProgressBar` + `Button` components
- Answer encoding: `JSON.stringify(answers)` → `encodeURIComponent()` → URL searchParam `a`
- Navigation: `useRouter().push(/result?a=...)`
- Back button visible from step 2+

**Result page** (`"use client"`):
```
Flow:
1. Read searchParams → decode answers
2. Call recommendDecks(answers) → get recommendations
3. Display top 3 as prominent DeckCards (rank 1 slightly larger)
4. Below: expandable "전체 순위 보기" section → all 18 decks ranked
5. Buttons: "다시 하기" → /quiz, "처음으로" → /
```

- **Important**: Next.js 15 — `searchParams` is async. Must use `useSearchParams()` in client component
- Uses `useSearchParams()` from `next/navigation`
- Uses `DeckCard` + `Button` + `Badge` components
- Loads leader data from `@/data/leaders.json` to resolve `leaderId`
- Edge case: no `a` param or invalid data → show friendly error + redirect link

**Error boundary** (`src/app/error.tsx`):
```typescript
"use client";
// Handles runtime errors with Korean message
// "문제가 발생했어요. 다시 시도해 주세요."
// Reset button + home link
```

**404 page** (`src/app/not-found.tsx`):
```typescript
// "페이지를 찾을 수 없어요."
// Home link
```

**Acceptance criteria**:
- [ ] Full flow works: Home → Quiz (5 questions) → Result (3 decks)
- [ ] Browser back/forward buttons work correctly
- [ ] Refresh on result page preserves results (URL params)
- [ ] Direct `/result` access (no params) shows error gracefully
- [ ] Previous/Next navigation in quiz works
- [ ] Progress bar updates correctly
- [ ] "전체 순위 보기" toggles full ranking list
- [ ] Mobile (375px) layout works end-to-end

---

### Wave 5 — Integration & QA

#### Task 7: Polish, Error Handling & Build Verification

**Category**: `deep`
**Dependencies**: Task 5 + Task 6 completed
**Estimated time**: 20-30 min

**Checklist**:

1. **End-to-end flow verification**:
   - [ ] Home → "덱 추천 받기" → Quiz step 1
   - [ ] Answer all 5 questions with navigation (next/previous)
   - [ ] "결과 보기" → Result page with 3 recommendations
   - [ ] "전체 순위 보기" → expand full list
   - [ ] "다시 하기" → back to quiz (reset state)
   - [ ] "처음으로" → back to home

2. **Edge cases**:
   - [ ] Direct URL `/result` (no params) → error handling
   - [ ] Direct URL `/quiz` → starts at question 1
   - [ ] Malformed `/result?a=garbage` → error handling
   - [ ] Nonexistent route → 404 page

3. **Responsive design**:
   - [ ] 375px (iPhone SE) — all content readable, touch targets adequate
   - [ ] 768px (tablet) — reasonable layout
   - [ ] 1280px+ (desktop) — centered content, not too wide

4. **Accessibility**:
   - [ ] All interactive elements keyboard-navigable
   - [ ] Quiz options selectable with Enter/Space
   - [ ] Appropriate `aria-label` on buttons without visible text
   - [ ] Color contrast meets WCAG AA

5. **Code quality**:
   - [ ] `pnpm tsc --noEmit` — zero errors
   - [ ] `pnpm lint` — zero errors
   - [ ] `pnpm format:check` — zero issues (run `pnpm format` if needed)
   - [ ] `pnpm test -- run` — all tests green
   - [ ] `pnpm build` — production build succeeds
   - [ ] No `any` types, no `@ts-ignore`, no `!` assertions

6. **Cleanup**:
   - [ ] Remove unused create-next-app boilerplate files/images
   - [ ] Remove unused CSS
   - [ ] Verify `public/` directory is clean

**Acceptance criteria**:
- [ ] All 5 build commands pass (tsc, lint, format:check, test, build)
- [ ] Full user flow works without errors
- [ ] Mobile-usable layout

---

## 5. Type Definitions Reference

All types defined in `src/lib/types.ts`:

```typescript
// ============================================================
// Domain Value Types
// ============================================================

export type Color = "Red" | "Green" | "Blue" | "Purple" | "Black" | "Yellow";
export type Playstyle = "aggro" | "midrange" | "control" | "combo";
export type Tier = "S" | "A" | "B" | "C";
export type Difficulty = "easy" | "medium" | "hard";
export type BudgetTier = "budget" | "mid" | "expensive";

// ============================================================
// Domain Entities
// ============================================================

export interface Leader {
  id: string;            // e.g. "OP11-040"
  name: string;          // English: "Monkey D. Luffy"
  nameKo: string;        // Korean: "몽키 D. 루피"
  colors: Color[];       // e.g. ["Blue", "Purple"]
  life: number;          // e.g. 3
  power: number;         // e.g. 6000
  set: string;           // e.g. "OP-11"
}

export interface Deck {
  id: string;            // e.g. "bp-luffy"
  name: string;          // English: "Blue Purple Luffy"
  nameKo: string;        // Korean: "청자 루피"
  leaderId: string;      // FK → Leader.id
  colors: Color[];
  playstyle: Playstyle[];
  tier: Tier;
  difficulty: Difficulty;
  budgetTier: BudgetTier;
  keyMechanic: string;   // e.g. "DON!! 램프로 빠른 대형 유닛 전개"
  description: string;   // Korean, 2-3 sentences
  strengths: string[];   // Korean: ["강력한 후반 피니셔", ...]
  weaknesses: string[];  // Korean: ["초반 방어가 약함", ...]
  tags: string[];        // ["밀짚모자", "램프", "콤보"]
}

// ============================================================
// Quiz Types
// ============================================================

export interface QuizQuestion {
  id: string;            // e.g. "q1-experience"
  text: string;          // Korean question text
  description: string;   // Korean helper text
  options: QuizOption[];
}

export interface QuizOption {
  id: string;            // e.g. "q1-beginner"
  text: string;          // Korean option text
  icon: string;          // Emoji: "🌱"
  weights: ScoringWeights;
}

export interface ScoringWeights {
  colors?: Partial<Record<Color, number>>;
  playstyles?: Partial<Record<Playstyle, number>>;
  tiers?: Partial<Record<Tier, number>>;
  difficulties?: Partial<Record<Difficulty, number>>;
}

// ============================================================
// Quiz State
// ============================================================

export interface QuizState {
  currentStep: number;
  answers: Record<string, string>;  // questionId → optionId
  isComplete: boolean;
}

// ============================================================
// Recommendation Result
// ============================================================

export interface DeckRecommendation {
  deck: Deck;
  leader: Leader;
  score: number;
  matchReasons: string[];  // Korean: ["공격적인 플레이 스타일에 딱 맞아요!", ...]
}

// ============================================================
// Aggregated Weights (internal to scoring)
// ============================================================

export interface AggregatedWeights {
  colors: Record<Color, number>;
  playstyles: Record<Playstyle, number>;
  tiers: Record<Tier, number>;
  difficulties: Record<Difficulty, number>;
}
```

---

## 6. Full Deck Data Specification (18 Decks)

### Leaders (`leaders.json`)

```jsonc
[
  // --- Tier S Leaders ---
  { "id": "OP11-040", "name": "Monkey D. Luffy",   "nameKo": "몽키 D. 루피",      "colors": ["Blue","Purple"],  "life": 3, "power": 6000, "set": "OP-11" },
  { "id": "EB02-010", "name": "Monkey D. Luffy",   "nameKo": "몽키 D. 루피",      "colors": ["Green","Purple"], "life": 4, "power": 5000, "set": "EB-02" },
  { "id": "OP05-060", "name": "Monkey D. Luffy",   "nameKo": "몽키 D. 루피",      "colors": ["Purple"],         "life": 4, "power": 5000, "set": "OP-05" },
  { "id": "OP05-002", "name": "Belo Betty",        "nameKo": "벨로 베티",          "colors": ["Red","Yellow"],   "life": 4, "power": 5000, "set": "OP-05" },

  // --- Tier A Leaders ---
  { "id": "OP01-001", "name": "Roronoa Zoro",      "nameKo": "로로노아 조로",       "colors": ["Red"],            "life": 5, "power": 5000, "set": "OP-01" },
  { "id": "OP09-081", "name": "Marshall D. Teach",  "nameKo": "마샬 D. 티치",      "colors": ["Black"],          "life": 4, "power": 5000, "set": "OP-09" },
  { "id": "OP07-079", "name": "Rob Lucci",         "nameKo": "롭 루치",            "colors": ["Black"],          "life": 5, "power": 5000, "set": "OP-07" },
  { "id": "OP07-019", "name": "Jewelry Bonney",    "nameKo": "쥬얼리 보니",        "colors": ["Green"],          "life": 5, "power": 5000, "set": "OP-07" },
  { "id": "OP10-001", "name": "Smoker",            "nameKo": "스모커",             "colors": ["Red","Green"],    "life": 4, "power": 5000, "set": "OP-10" },
  { "id": "OP06-022", "name": "Yamato",            "nameKo": "야마토",             "colors": ["Green","Yellow"], "life": 4, "power": 5000, "set": "OP-06" },
  { "id": "OP09-042", "name": "Buggy",             "nameKo": "버기",               "colors": ["Blue"],           "life": 5, "power": 5000, "set": "OP-09" },

  // --- Tier B Leaders ---
  { "id": "OP09-001", "name": "Shanks",            "nameKo": "샹크스",             "colors": ["Red"],            "life": 4, "power": 5000, "set": "OP-09" },
  { "id": "OP10-022", "name": "Trafalgar Law",     "nameKo": "트라팔가 로",         "colors": ["Green","Yellow"], "life": 4, "power": 5000, "set": "OP-10" },
  { "id": "OP11-041", "name": "Nami",              "nameKo": "나미",               "colors": ["Blue","Yellow"],  "life": 5, "power": 5000, "set": "OP-11" },
  { "id": "OP09-061", "name": "Monkey D. Luffy",   "nameKo": "몽키 D. 루피",      "colors": ["Purple","Black"], "life": 4, "power": 5000, "set": "OP-09" },

  // --- Tier C Leaders ---
  { "id": "OP11-062", "name": "Katakuri",          "nameKo": "카타쿠리",           "colors": ["Purple"],         "life": 4, "power": 5000, "set": "OP-11" },
  { "id": "OP08-002", "name": "Marco",             "nameKo": "마르코",             "colors": ["Red","Blue"],     "life": 4, "power": 5000, "set": "OP-08" },
  { "id": "OP06-042", "name": "Vinsmoke Reiju",    "nameKo": "빈스모크 레이쥬",     "colors": ["Blue","Purple"],  "life": 4, "power": 5000, "set": "OP-06" }
]
```

### Decks (`decks.json`)

| # | id | nameKo | leaderId | colors | playstyle | tier | difficulty | budgetTier | keyMechanic |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `bp-luffy` | 청자 루피 | OP11-040 | Blue, Purple | midrange, combo | S | hard | expensive | DON!! 램프 → 대형 유닛 전개 |
| 2 | `gp-luffy` | 녹자 루피 | EB02-010 | Green, Purple | midrange, control | S | hard | mid | 돈 가속 + 리소스 회수 |
| 3 | `p-luffy` | 자 루피 | OP05-060 | Purple | combo, control | S | medium | mid | 트래시에서 유닛 부활 |
| 4 | `ry-betty` | 적황 벨로 베티 | OP05-002 | Red, Yellow | aggro | S | easy | mid | 저코스트 러시 + 트리거 |
| 5 | `r-zoro` | 적 조로 | OP01-001 | Red | aggro | A | easy | budget | 단순 공격 + 파워 부스트 |
| 6 | `bk-teach` | 흑 티치 | OP09-081 | Black | control | A | medium | mid | 상대 유닛 제거 + KO 효과 |
| 7 | `bk-lucci` | 흑 루치 | OP07-079 | Black | control | A | medium | mid | 저코스트 제거 + 방어 |
| 8 | `g-bonney` | 녹 보니 | OP07-019 | Green | midrange | A | medium | mid | 유닛 바운스 + 재활용 |
| 9 | `rg-smoker` | 적녹 스모커 | OP10-001 | Red, Green | aggro, midrange | A | medium | mid | 어그로 시작 → 미드레인지 전환 |
| 10 | `gy-yamato` | 녹황 야마토 | OP06-022 | Green, Yellow | midrange | A | medium | mid | 대형 유닛 + 트리거 방어 |
| 11 | `b-buggy` | 청 버기 | OP09-042 | Blue | control, combo | A | medium | mid | 핸드 컨트롤 + 바운스 |
| 12 | `r-shanks` | 적 샹크스 | OP09-001 | Red | aggro | B | easy | budget | 단순 비트다운 |
| 13 | `gy-law` | 녹황 로 | OP10-022 | Green, Yellow | midrange, combo | B | hard | mid | 콤보 연계 + 유연한 전략 |
| 14 | `by-nami` | 청황 나미 | OP11-041 | Blue, Yellow | control | B | medium | mid | 방어 트리거 + 핸드 컨트롤 |
| 15 | `bkp-luffy` | 흑자 루피 | OP09-061 | Purple, Black | combo | B | hard | mid | KO 효과 + 트래시 부활 콤보 |
| 16 | `p-katakuri` | 자 카타쿠리 | OP11-062 | Purple | combo | C | hard | mid | 미래 예지 + 덱 조작 |
| 17 | `rb-marco` | 적청 마르코 | OP08-002 | Red, Blue | midrange | C | hard | expensive | 하이브리드 전략 |
| 18 | `bp-reiju` | 청자 레이쥬 | OP06-042 | Blue, Purple | combo | C | hard | mid | 저먼 66 시너지 콤보 |

Each deck entry also includes `description`, `strengths` (2-3 items), `weaknesses` (2-3 items), and `tags` in Korean.

Example single deck entry:
```json
{
  "id": "ry-betty",
  "name": "Red Yellow Belo Betty",
  "nameKo": "적황 벨로 베티",
  "leaderId": "OP05-002",
  "colors": ["Red", "Yellow"],
  "playstyle": ["aggro"],
  "tier": "S",
  "difficulty": "easy",
  "budgetTier": "mid",
  "keyMechanic": "저코스트 유닛 러시 + 라이프 트리거",
  "description": "낮은 코스트의 유닛들을 빠르게 전개하여 상대를 압박하는 어그로 덱. 라이프 트리거로 방어력도 갖추고 있어 초보자도 쉽게 다룰 수 있습니다. 현재 메타에서 가장 높은 승률을 기록하고 있는 강력한 덱입니다.",
  "strengths": [
    "빠른 게임 템포로 상대를 압박",
    "라이프 트리거로 방어 가능",
    "심플한 플레이로 초보자 친화적"
  ],
  "weaknesses": [
    "후반부에 리소스가 부족해질 수 있음",
    "대형 유닛 상대 시 돌파력 부족"
  ],
  "tags": ["혁명군", "어그로", "러시", "초보자 추천", "S티어"]
}
```

---

## 7. Quiz Questions Design

`questions.json` — 5 questions, each with scoring weights that influence deck recommendation.

### Q1: 경험 수준 (Experience Level)

```json
{
  "id": "q1-experience",
  "text": "원피스 카드 게임 경험이 어느 정도인가요?",
  "description": "덱의 난이도를 결정하는 데 참고해요",
  "options": [
    {
      "id": "q1-beginner",
      "text": "처음이에요!",
      "icon": "🌱",
      "weights": {
        "difficulties": { "easy": 3, "medium": 1 },
        "tiers": { "A": 1, "B": 1 }
      }
    },
    {
      "id": "q1-intermediate",
      "text": "몇 번 해봤어요",
      "icon": "📚",
      "weights": {
        "difficulties": { "easy": 1, "medium": 3, "hard": 1 }
      }
    },
    {
      "id": "q1-experienced",
      "text": "꽤 많이 했어요!",
      "icon": "🔥",
      "weights": {
        "difficulties": { "medium": 1, "hard": 3 },
        "tiers": { "S": 1 }
      }
    }
  ]
}
```

### Q2: 플레이스타일 (Playstyle)

```json
{
  "id": "q2-playstyle",
  "text": "어떤 스타일로 게임하고 싶으세요?",
  "description": "가장 중요한 질문이에요! 덱의 핵심 전략을 결정합니다",
  "options": [
    {
      "id": "q2-aggro",
      "text": "빠르게 공격해서 이기고 싶어요!",
      "icon": "⚔️",
      "weights": { "playstyles": { "aggro": 3 } }
    },
    {
      "id": "q2-midrange",
      "text": "균형 잡힌 전략으로 유연하게!",
      "icon": "⚖️",
      "weights": { "playstyles": { "midrange": 3 } }
    },
    {
      "id": "q2-control",
      "text": "방어하면서 후반에 역전!",
      "icon": "🛡️",
      "weights": { "playstyles": { "control": 3 } }
    },
    {
      "id": "q2-combo",
      "text": "독특한 콤보로 한 방!",
      "icon": "🎯",
      "weights": { "playstyles": { "combo": 3 } }
    }
  ]
}
```

### Q3: 선호 색상 (Color Preference)

```json
{
  "id": "q3-color",
  "text": "마음에 드는 색상을 골라주세요!",
  "description": "원피스 카드 게임의 6가지 색상은 각각 다른 전략을 대표해요",
  "options": [
    { "id": "q3-red",    "text": "레드 — 정열적인 공격",     "icon": "🔴", "weights": { "colors": { "Red": 3 } } },
    { "id": "q3-green",  "text": "그린 — 성장과 버프",       "icon": "🟢", "weights": { "colors": { "Green": 3 } } },
    { "id": "q3-blue",   "text": "블루 — 전략적 컨트롤",     "icon": "🔵", "weights": { "colors": { "Blue": 3 } } },
    { "id": "q3-purple", "text": "퍼플 — 트리키한 플레이",   "icon": "🟣", "weights": { "colors": { "Purple": 3 } } },
    { "id": "q3-black",  "text": "블랙 — 상대 방해와 제거",  "icon": "⚫", "weights": { "colors": { "Black": 3 } } },
    { "id": "q3-yellow", "text": "옐로 — 트리거와 방어",     "icon": "🟡", "weights": { "colors": { "Yellow": 3 } } },
    {
      "id": "q3-any",
      "text": "상관없어요!",
      "icon": "🌈",
      "weights": {
        "colors": { "Red": 1, "Green": 1, "Blue": 1, "Purple": 1, "Black": 1, "Yellow": 1 }
      }
    }
  ]
}
```

### Q4: 게임 목적 (Competitive vs Casual)

```json
{
  "id": "q4-goal",
  "text": "어떤 목적으로 덱을 찾고 있나요?",
  "description": "대회용 덱과 캐주얼 덱은 추천 기준이 달라요",
  "options": [
    {
      "id": "q4-competitive",
      "text": "대회에서 이기고 싶어요!",
      "icon": "🏆",
      "weights": { "tiers": { "S": 3, "A": 2 } }
    },
    {
      "id": "q4-casual",
      "text": "친구들과 재미있게 즐기고 싶어요!",
      "icon": "🎉",
      "weights": { "tiers": { "A": 1, "B": 2, "C": 2 } }
    },
    {
      "id": "q4-both",
      "text": "이기면서도 재미있게!",
      "icon": "💪",
      "weights": { "tiers": { "S": 2, "A": 2, "B": 1 } }
    }
  ]
}
```

### Q5: 덱 복잡도 (Complexity Preference)

```json
{
  "id": "q5-complexity",
  "text": "덱의 복잡도는 어느 정도가 좋으세요?",
  "description": "복잡한 덱일수록 마스터하면 강하지만, 배우는 데 시간이 걸려요",
  "options": [
    {
      "id": "q5-simple",
      "text": "심플하고 직관적인 덱이 좋아요",
      "icon": "👌",
      "weights": { "difficulties": { "easy": 3, "medium": 1 } }
    },
    {
      "id": "q5-moderate",
      "text": "적당히 생각할 거리가 있으면 좋겠어요",
      "icon": "🧩",
      "weights": { "difficulties": { "medium": 3 } }
    },
    {
      "id": "q5-complex",
      "text": "복잡해도 괜찮아요, 강하면 돼요!",
      "icon": "🧠",
      "weights": { "difficulties": { "medium": 1, "hard": 3 } }
    }
  ]
}
```

---

## 8. Scoring Engine Design

### Algorithm Overview

```
User Answers → Aggregate Weights → Score Each Deck → Sort → Top 3 + Full Ranking
```

### Step 1: Aggregate Weights

Merge all selected options' `weights` into a single `AggregatedWeights` object.

```typescript
// scoring.ts
export function aggregateWeights(
  answers: Record<string, string>,  // { "q1-experience": "q1-beginner", ... }
  questions: QuizQuestion[],
): AggregatedWeights {
  const result: AggregatedWeights = {
    colors:       { Red: 0, Green: 0, Blue: 0, Purple: 0, Black: 0, Yellow: 0 },
    playstyles:   { aggro: 0, midrange: 0, control: 0, combo: 0 },
    tiers:        { S: 0, A: 0, B: 0, C: 0 },
    difficulties: { easy: 0, medium: 0, hard: 0 },
  };

  for (const question of questions) {
    const selectedOptionId = answers[question.id];
    if (!selectedOptionId) continue;

    const option = question.options.find((o) => o.id === selectedOptionId);
    if (!option) continue;

    const w = option.weights;
    // Merge each weight category additively
    if (w.colors)       for (const [k, v] of Object.entries(w.colors))       result.colors[k] += v;
    if (w.playstyles)   for (const [k, v] of Object.entries(w.playstyles))   result.playstyles[k] += v;
    if (w.tiers)        for (const [k, v] of Object.entries(w.tiers))        result.tiers[k] += v;
    if (w.difficulties) for (const [k, v] of Object.entries(w.difficulties)) result.difficulties[k] += v;
  }

  return result;
}
```

### Step 2: Calculate Per-Deck Score

For each deck, compute a weighted sum across 4 dimensions:

```typescript
// scoring.ts
const CATEGORY_MULTIPLIERS = {
  color: 1.0,
  playstyle: 1.5,     // Heaviest — core user preference
  tier: 1.0,
  difficulty: 0.8,
} as const;

export function calculateDeckScore(
  deck: Deck,
  weights: AggregatedWeights,
): number {
  // Color score: sum of weights for each color the deck has
  const colorScore = deck.colors.reduce(
    (sum, color) => sum + (weights.colors[color] ?? 0), 0
  );

  // Playstyle score: sum of weights for each playstyle the deck has
  const playstyleScore = deck.playstyle.reduce(
    (sum, style) => sum + (weights.playstyles[style] ?? 0), 0
  );

  // Tier score: weight for the deck's tier
  const tierScore = weights.tiers[deck.tier] ?? 0;

  // Difficulty score: weight for the deck's difficulty
  const difficultyScore = weights.difficulties[deck.difficulty] ?? 0;

  return (
    colorScore      * CATEGORY_MULTIPLIERS.color +
    playstyleScore  * CATEGORY_MULTIPLIERS.playstyle +
    tierScore       * CATEGORY_MULTIPLIERS.tier +
    difficultyScore * CATEGORY_MULTIPLIERS.difficulty
  );
}
```

**Rationale for multipliers**:
- `playstyle: 1.5` — Q2 is labeled "가장 중요한 질문" and directly determines user enjoyment
- `color: 1.0` — Strong preference signal but multi-color decks naturally score higher
- `tier: 1.0` — Competitive vs casual is an important filter
- `difficulty: 0.8` — Slightly lower because experience/complexity can be learned

### Step 3: Generate Recommendations

```typescript
// recommend.ts
const MAX_RECOMMENDATIONS = 3;

export function recommendDecks(
  answers: Record<string, string>,
): DeckRecommendation[] {
  const questions: QuizQuestion[] = questionsData;
  const decks: Deck[] = decksData;
  const leaders: Leader[] = leadersData;

  const weights = aggregateWeights(answers, questions);

  const scored = decks
    .map((deck) => ({
      deck,
      leader: leaders.find((l) => l.id === deck.leaderId)!,
      score: calculateDeckScore(deck, weights),
      matchReasons: generateMatchReasons(deck, weights),
    }))
    .sort((a, b) => b.score - a.score);

  return scored;
  // Caller uses .slice(0, 3) for top 3, full array for complete ranking
}
```

### Step 4: Generate Match Reasons

```typescript
// recommend.ts
export function generateMatchReasons(
  deck: Deck,
  weights: AggregatedWeights,
): string[] {
  const reasons: string[] = [];

  // Playstyle match
  const topPlaystyle = getTopKey(weights.playstyles);
  if (topPlaystyle && deck.playstyle.includes(topPlaystyle)) {
    const labels: Record<Playstyle, string> = {
      aggro: "공격적인", midrange: "균형 잡힌", control: "컨트롤", combo: "콤보",
    };
    reasons.push(`${labels[topPlaystyle]} 플레이 스타일에 딱 맞는 덱이에요!`);
  }

  // Color match
  const topColor = getTopKey(weights.colors);
  if (topColor && deck.colors.includes(topColor)) {
    const labels: Record<Color, string> = {
      Red: "레드", Green: "그린", Blue: "블루",
      Purple: "퍼플", Black: "블랙", Yellow: "옐로",
    };
    reasons.push(`선호하시는 ${labels[topColor]} 색상의 덱이에요!`);
  }

  // Tier match
  if (deck.tier === "S") {
    reasons.push("현재 메타에서 최상위 티어 덱이에요!");
  } else if (deck.tier === "A") {
    reasons.push("메타에서 안정적으로 활약하는 덱이에요!");
  }

  // Difficulty match
  const topDiff = getTopKey(weights.difficulties);
  if (topDiff && deck.difficulty === topDiff) {
    const labels: Record<Difficulty, string> = {
      easy: "심플하고 배우기 쉬운", medium: "적당한 깊이의", hard: "마스터하면 강력한",
    };
    reasons.push(`${labels[topDiff]} 덱이에요!`);
  }

  // Fallback
  if (reasons.length === 0) {
    reasons.push("다양한 선호도를 균형 있게 충족하는 덱이에요!");
  }

  return reasons.slice(0, 3); // Max 3 reasons
}

// Helper: find the key with highest value
function getTopKey<T extends string>(record: Record<T, number>): T | null {
  let maxKey: T | null = null;
  let maxVal = 0;
  for (const [key, val] of Object.entries(record) as [T, number][]) {
    if (val > maxVal) { maxVal = val; maxKey = key; }
  }
  return maxKey;
}
```

### Score Examples (Sanity Check)

**Scenario**: Beginner who likes aggro, Red, competitive, simple decks.
- Answers: q1-beginner, q2-aggro, q3-red, q4-competitive, q5-simple

| Weight Category | Aggregated Values |
|---|---|
| colors | Red: 3 |
| playstyles | aggro: 3 |
| tiers | S: 3, A: 3, B: 1 |
| difficulties | easy: 6, medium: 2 |

**Expected top results**:

| Deck | Color | Playstyle | Tier | Diff | Score Calculation |
|------|-------|-----------|------|------|-------------------|
| 적황 벨로 베티 | Red(3) | aggro(3) | S(3) | easy(6) | 3×1.0 + 3×1.5 + 3×1.0 + 6×0.8 = **15.3** |
| 적 조로 | Red(3) | aggro(3) | A(3) | easy(6) | 3×1.0 + 3×1.5 + 3×1.0 + 6×0.8 = **15.3** |
| 적 샹크스 | Red(3) | aggro(3) | B(1) | easy(6) | 3×1.0 + 3×1.5 + 1×1.0 + 6×0.8 = **13.3** |
| 적녹 스모커 | Red(3) | aggro(3),mid(0) | A(3) | med(2) | 3×1.0 + 3×1.5 + 3×1.0 + 2×0.8 = **12.1** |

Betty and Zoro tied at 15.3 — both are correct recommendations. Tiebreaker: deck order in array (higher tier first). This validates the algorithm works as expected for a beginner aggro player.

---

## 9. File Creation Summary

Complete list of every file this project will contain (excluding auto-generated like `node_modules/`, `.next/`, `next-env.d.ts`):

| # | File | Wave | Task | Action |
|---|------|------|------|--------|
| 1 | `package.json` | 1 | 1 | auto-gen + modify |
| 2 | `tsconfig.json` | 1 | 1 | auto-gen + verify |
| 3 | `next.config.ts` | 1 | 1 | auto-gen |
| 4 | `postcss.config.mjs` | 1 | 1 | auto-gen |
| 5 | `eslint.config.mjs` | 1 | 1 | auto-gen + modify |
| 6 | `.gitignore` | 1 | 1 | auto-gen |
| 7 | `vitest.config.mts` | 1 | 1 | **create** |
| 8 | `.prettierrc` | 1 | 1 | **create** |
| 9 | `.prettierignore` | 1 | 1 | **create** |
| 10 | `src/test/setup.ts` | 1 | 1 | **create** |
| 11 | `src/app/globals.css` | 1 | 1 | auto-gen + modify |
| 12 | `src/app/layout.tsx` | 1→4 | 1, 5 | auto-gen + modify(x2) |
| 13 | `src/app/page.tsx` | 1→4 | 1, 5 | auto-gen + rewrite |
| 14 | `src/lib/types.ts` | 2 | 2 | **create** |
| 15 | `src/data/leaders.json` | 2 | 2 | **create** |
| 16 | `src/data/decks.json` | 2 | 2 | **create** |
| 17 | `src/data/questions.json` | 2 | 2 | **create** |
| 18 | `src/lib/scoring.ts` | 3 | 3 | **create** |
| 19 | `src/lib/recommend.ts` | 3 | 3 | **create** |
| 20 | `src/lib/scoring.test.ts` | 3 | 3 | **create** |
| 21 | `src/lib/recommend.test.ts` | 3 | 3 | **create** |
| 22 | `src/components/ui/Button.tsx` | 3 | 4 | **create** |
| 23 | `src/components/ui/Card.tsx` | 3 | 4 | **create** |
| 24 | `src/components/ui/ProgressBar.tsx` | 3 | 4 | **create** |
| 25 | `src/components/ui/Badge.tsx` | 3 | 4 | **create** |
| 26 | `src/components/quiz/QuizOption.tsx` | 3 | 4 | **create** |
| 27 | `src/components/quiz/QuizStep.tsx` | 3 | 4 | **create** |
| 28 | `src/components/DeckCard.tsx` | 3 | 4 | **create** |
| 29 | `src/hooks/useQuizState.ts` | 3 | 4 | **create** |
| 30 | `src/app/quiz/page.tsx` | 4 | 6 | **create** |
| 31 | `src/app/result/page.tsx` | 4 | 6 | **create** |
| 32 | `src/app/error.tsx` | 4 | 6 | **create** |
| 33 | `src/app/not-found.tsx` | 4 | 6 | **create** |

**Total**: 33 files (10 auto-generated + modified, 23 created from scratch)

---

## 10. Risk & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| OP-11 meta data inaccuracy | Medium | Medium | 데이터를 JSON으로 분리하여 쉽게 수정 가능. 여러 소스 교차 검증 완료 |
| Tailwind v4 breaking changes | Low | Low | CSS-first 방식 사용. renamed utilities 주의 (bg-gradient → bg-linear 등) |
| Next.js 15 async params | Low | Medium | `useSearchParams()` client hook 사용으로 회피 |
| Score ties between decks | Low | High | Array 순서로 tiebreak (higher tier first). 동점 시 문제 없음 |
| 5 questions → low precision | Medium | Medium | 가중치 튜닝으로 보완. `questions.json` 수정만으로 질문 추가 가능한 구조 |
| JSON import type safety | Low | Low | TypeScript `resolveJsonModule` + 타입 단언으로 해결 |

---

## 11. Future Enhancements (Out of Scope)

Not part of this plan, but the architecture supports:

- Additional quiz questions (just add to `questions.json`)
- OP-12+ deck data updates (just update JSON files)
- Deck detail pages (`/deck/[id]`)
- Share result via URL (already using URL params)
- Dark mode (Tailwind v4 `@theme` supports it)
- Animation polish (page transitions, card reveals)

---

## 12. Parallel Execution Opportunities

| Pair | Can Parallel? | Reason |
|------|:---:|--------|
| Task 3 + Task 4 | **Yes** | 서로 다른 레이어 (logic vs UI), 공통 의존은 types.ts뿐 |
| Task 5 + Task 6 | **Yes** | 서로 다른 라우트, 공유 컴포넌트는 이미 완성 |
| Task 3 + Task 5 | No | Task 5에서 recommend 로직 필요 |
| Task 4 + Task 6 | No | Task 6에서 quiz 컴포넌트 필요 |
