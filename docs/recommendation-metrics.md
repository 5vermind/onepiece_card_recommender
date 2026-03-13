# Recommendation Engine Metrics

Deck recommendation quality evaluation metrics.

Scoring formula:

```
colorScore    = SUM(matching color weights) / deck.colors.length * 1.0
playstyleScore = SUM(matching playstyle weights) / deck.playstyle.length * 1.5
tierScore      = tier weight * 1.3
difficultyScore = difficulty weight * 0.8
budgetScore    = budget weight * 0.6

base  = colorScore + playstyleScore + tierScore + difficultyScore + budgetScore
final = base + synergyBonus (1.5 ~ 2.5)
```

- 5 categories: color, playstyle, tier, difficulty, budget
- color/playstyle scores normalized by attribute count (prevents multi-attribute structural bias)
- 6 synergy rules (bonus range: 1.5 ~ 2.5)
- 18 decks, 7 questions (conditional branching at slot 3)
- Total valid answer combinations: 11,340

---

## Level 1. Offline Static Analysis

No user data required. Run `recommendDecks()` on all 11,340 answer combinations.

### Deck Coverage

All 11,340 combinations -> top-K 등장 여부.

- **전체 커버리지**: 18개 덱 중 top-3에 1번이라도 등장하는 덱 수
- **Dead deck 탐지**: 어떤 조합에서도 top-3에 못 들어가는 덱
- **측정 범위**: top-3, top-5 각각 측정

기대값: 모든 덱이 최소 1개 조합에서 top-3에 등장해야 함.
위반 시: 해당 덱의 가중치 또는 속성 매핑 점검 필요.

### Dominance Check

- **전체 지배**: 모든 조합에서 top-3에 들어가는 덱 (= 가중치 설계 결함)
- **높은 빈도**: top-3 등장 빈도 > 50%인 덱
- **구조적 유리함 의심**: multi-color/multi-playstyle 덱이 합산 구조에서 유리한지

Resolved: attribute normalization으로 multi-attribute 구조적 유리함 제거됨.

### Score Spread

- **Top-1 vs Top-2 gap**: 1위-2위 점수 차이 분포
- Gap이 너무 작으면 (< 0.5) 추천 불안정
- Gap이 너무 크면 (> 5.0) 가중치 과도
- **Score standard deviation**: 전체 18덱 점수의 표준편차

### Preference Alignment Rate

Top-3 추천 결과가 유저 선택을 실제로 반영하는지.

- Playstyle alignment: 어그로 선택 -> top-3에 aggro 덱 비율
- Color alignment: 레드 선택 -> top-3에 Red 덱 비율
- Difficulty alignment: 초보 -> top-3에 easy/medium 덱 비율

### Sensitivity Analysis

답변 1개만 변경했을 때 top-3 결과 변화.

- **Single-answer impact**: 1문항 변경시 top-3 중 바뀌는 덱 수
- **Category multiplier sensitivity**: multiplier +/-20% 시 순위 변화
- **Synergy on/off**: synergy rule 적용/미적용 순위 차이

현재 의심: q7-character (color weight 1~2, multiplier 1.0) 의 영향력이 너무 낮을 수 있음.

---

## Level 2. Golden Set Evaluation

Expert-defined expected outcomes for canonical profiles.

### Profile Precision@K

Canonical profile -> expected deck list 정의 -> top-K 매칭률.

| Profile                                     | Expected Top-3          |
| ------------------------------------------- | ----------------------- |
| Beginner + Aggro + Red + Budget             | `ry-betty`, `r-zoro`    |
| Experienced + Control + Black + Competitive | `bk-teach`, `g-bonney`  |
| Intermediate + Midrange + Green + Casual    | `rg-smoker`, `g-bonney` |
| Experienced + Combo + Competitive           | `bp-luffy`, `gp-luffy`  |

### Expected Reciprocal Rank (ERR)

기대 덱이 실제 순위 리스트에서 몇 번째에 위치하는지.
ERR = 1/rank. (1위 = 1.0, 3위 = 0.33)

### Coherence Score

Top-3 추천 간 playstyle/tier 일관성.
어그로 선호 유저에게 aggro, control, combo 혼재 -> low coherence.

### Intra-List Diversity

Top-3 간 color/playstyle 다양성. 적절한 다양성은 선택지 제공.
너무 높으면 -> 가중치가 변별력 없음을 의미.

---

## Level 3. User Behavioral Metrics (Umami)

Existing analytics events in `src/lib/analytics.ts`.

| Metric               | Event Source                          | Signal                           |
| -------------------- | ------------------------------------- | -------------------------------- |
| Quiz Completion Rate | `quiz_started` -> `quiz_completed`    | UX friction                      |
| Top-1 Engagement     | `deck_expanded` where rank=1          | top-1 satisfaction               |
| Exploration Depth    | avg `deck_expanded` count per session | top results insufficient?        |
| Show All Rate        | `show_all_clicked` / `result_viewed`  | top results unsatisfying         |
| Retry Rate           | `retry_clicked` / `result_viewed`     | strongest dissatisfaction signal |
| Share Rate           | `share_clicked` / `result_viewed`     | satisfaction proxy               |

---

## Resolved Concerns

1. **Multi-attribute structural advantage** (FIXED):
   - Problem: `reduce(sum)` gave dual-color/dual-playstyle decks 2x score accumulation.
     B-tier dual-attr decks (자흑 루피, 적청 마르코) systematically outscored A-tier single-attr decks (녹 보니, 흑 티치).
   - Fix: Normalize by attribute count (`sum / deck.colors.length`, `sum / deck.playstyle.length`).
   - Result: Multi/Single avg score ratio 1.21x -> 0.95x.

2. **Tier weight too weak relative to attribute scores** (FIXED):
   - Problem: Tier multiplier 1.0 contributed avg +0.66 for A vs B, but multi-attr advantage was -2.8.
   - Fix: Tier multiplier 1.0 -> 1.3 (modest increase to avoid meta bias from subjective tier assignments).
   - Result: S > A > B > C separation now natural: 24.0% > 19.5% > 12.7% > 4.5%.

## Remaining Concerns

1. **Synergy bonus scale**: bonus 1.5~2.5 vs typical base score ~7~10.
   May shift rank by 1~2 positions.
2. **q7-character low impact**: color weights 1~2 with multiplier 1.0.
   Likely negligible effect on final ranking.
3. **Control preference test failure** (pre-existing):
   "Experienced + Control" profile does not rank 2+ control decks in top-3.
   Likely needs dedicated synergy rule or control weight adjustment.

---

## Implementation Priority

1. ~~**Deck Coverage + Dominance Check**~~ DONE -> `src/lib/metrics.test.ts`
2. **Preference Alignment Rate** -> core trust metric
3. **Score Spread** -> weight tuning foundation
4. **Golden Set Precision@K** -> regression prevention via tests
