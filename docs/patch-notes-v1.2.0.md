# Patch Notes — v1.2.0 (2025-03-16)

## 스코어링 구조 개선, q7 제거, 에넬 덱 추가

### 요약

예산/난이도 가중치를 부스터에서 패널티 필터로 전환하고, 의미 없는 캐릭터 질문(q7)을 제거했습니다. 황 에넬 덱을 추가하고, q3 색깔 설명 문구를 실제 게임플레이에 맞게 수정했습니다.

---

## 문제 (Before)

### 1. 예산/난이도가 부스터로 작동

`q1-beginner`가 `{ easy: 3, medium: 1 }`처럼 양수 가중치를 부여해, 쉬운 덱을 "밀어올리는" 역할을 했습니다. 의미상 "어려운 덱을 피하고 싶다"에 가까운데, 구조가 "쉬운 덱을 원한다"로 왜곡되어 있었습니다.

### 2. 경험자/고예산에 S티어 가중치 유출

`q1-experienced`와 `q6-high`에 `tiers: { S: 1 }`이 포함되어 있어, 메타 선호(q4)나 목표(q5)와 무관하게 S티어 덱이 암묵적으로 부스트되고 있었습니다.

### 3. q7 캐릭터 질문의 무의미함

프로덕션 Umami 데이터 분석 결과:

- **75.6%** 의 유저가 "없음/상관없음" 선택
- 캐릭터 → 컬러 프록시 매핑이 의미적으로 부정확 (예: "루피 좋아함" → 특정 컬러 부스트)
- 실제 의사결정에 기여하지 않는 노이즈 질문

### 4. 듀얼 속성 정규화 과도

v1.1.0에서 도입한 `/ colors.length` 정규화가 듀얼 덱을 과도하게 억제하여, 적녹 스모커(A) 같은 경쟁력 있는 듀얼 덱의 노출이 필요 이상으로 낮았습니다.

### 5. q3 색깔 설명 부정확

각 컬러의 설명 텍스트가 실제 게임플레이와 거리가 있어 유저 선택에 혼란을 줄 수 있었습니다.

---

## 수정 내용

### 1. 예산/난이도 → 패널티 필터 전환 (`questions.json`)

"원하는 것에 가산점"이 아니라 "원하지 않는 것에 감점"으로 전환.

```
// Before (부스터)
q1-beginner:     { easy: 3, medium: 1 }
q1-intermediate: { easy: 1, medium: 3, hard: 1 }
q1-experienced:  { hard: 2, medium: 1, tiers: { S: 1 } }

// After (패널티 필터)
q1-beginner:     { hard: -3 }
q1-intermediate: { hard: -1 }
q1-experienced:  {}  ← 중립 (유저 확인)
```

```
// Before (부스터)
q6-low:  { budget: 3, mid: 1 }
q6-mid:  { budget: 1, mid: 3, expensive: 1 }
q6-high: { budget: 1, mid: 1, expensive: 3, tiers: { S: 1 } }

// After (패널티 필터)
q6-low:  { expensive: -3, mid: -1 }
q6-mid:  { expensive: -1 }
q6-high: {}  ← 중립
```

### 2. S티어 가중치 유출 제거

`q1-experienced`와 `q6-high`에서 `tiers: { S: 1 }` 제거. 티어 선호는 오직 q4(메타 포지션)와 q5(목표)에서만 결정됩니다.

### 3. q7 캐릭터 질문 제거

- `TOTAL_SLOTS: 7 → 6`
- 답변 코드: 7자리 → 6자리 (예: `1234567` → `123456`)
- questions.json에서 q7 항목 완전 삭제
- 모든 테스트 픽스쳐 및 메트릭스 업데이트 (158개 고유 코드, 660건 가중 합계)

### 4. 듀얼 속성 정규화 완화 (`scoring.ts`)

하드 나누기 대신 소프트 정규화로 전환. 듀얼 덱이 55.6%의 점수를 유지 (기존 50%).

```typescript
// Before (하드)
colorScore / deck.colors.length; // 듀얼 = 50%

// After (소프트)
const MULTI_ATTR_NORMALIZATION = 0.8;
const divisor = 1 + (deck.colors.length - 1) * MULTI_ATTR_NORMALIZATION;
colorScore / divisor; // 듀얼 = 55.6%
```

### 5. 스코어링 버전 태깅 (`analytics.ts`)

`quiz_completed`와 `result_viewed` 이벤트에 `sv` (scoring version) 필드 추가.

```typescript
SCORING_VERSION = "v1.2";
// Umami에서 sv 없음 = v1.0, sv="v1.2" = 현재 버전
```

### 6. 황 에넬 덱 추가 (`decks.json`, `leaders.json`)

19번째 덱으로 황 에넬 (OP05-098) 추가.

| 항목         | 값                                               |
| ------------ | ------------------------------------------------ |
| ID           | `y-enel`                                         |
| 리더         | OP05-098 에넬                                    |
| 컬러         | Yellow                                           |
| 플레이스타일 | control, midrange                                |
| 티어         | C                                                |
| 난이도       | medium                                           |
| 예산         | mid                                              |
| 핵심 메카닉  | 라이프 0 회복 + 트리거/라이프 조작 + 대형 피니셔 |

### 7. 청 버기 티어 하향 (`decks.json`)

OP-11 스타터덱(ST-21) 발매가 지연되면서, 스타터덱 기반 접근성을 고려한 A티어 평가가 현 시점에 맞지 않아 C로 하향. 스타터덱 발매 시 재평가 예정.

| 항목 | Before | After |
| ---- | :----: | :---: |
| 티어 |   A    |   C   |

> 기존 덱 리스트는 `src/data/archive/decks-v1.2.0.json`에 아카이빙.

### 8. q3 색깔 설명 텍스트 수정 (`questions.json`)

| 컬러   | Before           | After                   |
| ------ | ---------------- | ----------------------- |
| Red    | 정열적인 공격    | 높은 파워로 밀어붙이기  |
| Green  | 성장과 버프      | 상대를 묶고 견고한 수비 |
| Blue   | 전략적 컨트롤    | 되돌리기로 주도권 장악  |
| Purple | 트리키한 플레이  | 빠른 가속과 대형 전개   |
| Black  | 상대 방해와 제거 | 상대 약화와 제거        |
| Yellow | 트리거와 방어    | 라이프 트리거로 역전    |

---

## 검증

### 수정 전후 Top-1 비교 (Umami 660건 가중 기준)

| 덱                 | v1.1.0 | v1.2.0 |    변화    |
| ------------------ | :----: | :----: | :--------: |
| 자 루피 (S)        | 20.4%  | 22.0%  |   +1.6%    |
| 흑 티치 (A)        |  9.1%  | 15.6%  |  +6.5% ▲   |
| 적황 벨로 베티 (S) | 10.1%  | 13.3%  |  +3.2% ▲   |
| 청자 루피 (S)      | 30.1%  | 13.2%  |  -16.9% ▼  |
| 청 버기 (A→C)      |   —    |  7.0%  | 신규 진입  |
| 적 샹크스 (B)      |   —    |  7.0%  | 신규 진입  |
| 적녹 스모커 (A)    |   —    |  6.1%  | 신규 진입  |
| 녹 보니 (A)        |  4.4%  |  2.3%  |   -2.1%    |
| 자흑 루피 (B)      |  6.8%  |   —    | Top-1 탈락 |

주요 변화:

- 청자 루피 독점(30.1%) 해소 → 13.2%로 정상화
- 흑 티치, 벨로 베티 등 A/S 티어 덱 노출 증가
- 청 버기 C티어 하향에도 카운터/마이너 경로에서 7.0% Top-1 확보 — 티어 하향이 노출 제거가 아닌 적절한 재배치로 작동
- 적 샹크스, 적녹 스모커 등 중위권 덱 Top-1 진입
- 전반적 분포가 더 균등해짐

### 현재 스코어링 공식

```
colorDivisor = 1 + (colors.length - 1) * 0.8
playstyleDivisor = 1 + (playstyle.length - 1) * 0.8

score = (colorScore / colorDivisor) × 1.0
      + (playstyleScore / playstyleDivisor) × 1.5
      + tierScore × 1.3
      + difficultyScore × 0.8   ← 패널티 필터
      + budgetScore × 0.6       ← 패널티 필터
      + synergyBonus
```

### 테스트 결과

```
✓ scoring.test.ts      (16 tests)
✓ quiz-flow.test.ts    (10 tests)
✓ recommend.test.ts    (15 tests)
✓ metrics.test.ts      (11 tests)
───────────────────────────
52/52 tests passed
```

---

## 변경 파일

| 파일                                 | 변경                                             |
| ------------------------------------ | ------------------------------------------------ |
| `src/data/questions.json`            | 예산/난이도 패널티 전환, q7 제거, q3 텍스트 수정 |
| `src/data/decks.json`                | 황 에넬 덱 추가, 청 버기 A→C 하향                |
| `src/data/archive/decks-v1.2.0.json` | **신규** — 티어 변경 전 덱 리스트 아카이빙       |
| `src/data/leaders.json`              | 에넬 리더 (OP05-098) 추가                        |
| `src/lib/scoring.ts`                 | 소프트 정규화 (0.8), 패널티 필터 지원            |
| `src/lib/scoring.test.ts`            | 소프트 정규화 테스트                             |
| `src/lib/analytics.ts`               | `SCORING_VERSION = "v1.2"` + sv 필드             |
| `src/lib/quiz-flow.ts`               | `TOTAL_SLOTS: 7 → 6`                             |
| `src/lib/quiz-flow.test.ts`          | 슬롯 6 반영                                      |
| `src/lib/recommend.test.ts`          | q7 제거 반영, 덱 수 18→19                        |
| `src/lib/metrics.test.ts`            | 6자리 코드, 158개 고유 코드, 660건 가중          |
| `src/app/quiz/page.tsx`              | sv 필드 추가                                     |
| `src/app/result/ResultContent.tsx`   | sv 필드 추가                                     |
| `docs/user-path-analysis.md`         | **신규** — 유저 경로 분석                        |

---

## 커밋 히스토리

| 커밋      | 내용                                  |
| --------- | ------------------------------------- |
| `6d51545` | 예산/난이도 패널티 전환, q7 제거      |
| `2a5154a` | 스코어링 버전 태깅 (sv)               |
| `be9d490` | 에넬 덱 추가, q3 텍스트 수정          |
| (pending) | 청 버기 A→C 하향 + 덱 리스트 아카이빙 |

---

## 후속 과제

- [ ] 배포 후 Umami에서 v1.0 vs v1.2 분포 비교 (sv 필드 기준)
- [ ] Golden Set 테스트 추가 (전문가 기대 결과 기반)
- [ ] 주기적 Umami 데이터 갱신으로 가중 메트릭스 최신화
- [ ] 에넬 덱 추천 분포 모니터링 (C티어 적정 노출 확인)
- [ ] 청 버기 스타터덱(ST-21) 발매 시 티어 재평가 (C→A 복원 검토)
