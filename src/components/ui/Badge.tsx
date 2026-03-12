interface BadgeProps {
  variant: "color" | "tier" | "difficulty" | "playstyle";
  value: string;
}

const colorMap: Record<string, string> = {
  Red: "bg-op-red text-white",
  Green: "bg-op-green text-white",
  Blue: "bg-op-blue text-white",
  Purple: "bg-op-purple text-white",
  Black: "bg-op-black text-white",
  Yellow: "bg-op-yellow text-white",
};

const tierMap: Record<string, string> = {
  S: "bg-tier-s text-white",
  A: "bg-tier-a text-white",
  B: "bg-tier-b text-gray-800",
  C: "bg-tier-c text-white",
};

const difficultyMap: Record<string, string> = {
  easy: "bg-emerald-100 text-emerald-800",
  medium: "bg-amber-100 text-amber-800",
  hard: "bg-red-100 text-red-800",
};

const difficultyLabel: Record<string, string> = {
  easy: "쉬움",
  medium: "보통",
  hard: "어려움",
};

const playstyleLabel: Record<string, string> = {
  aggro: "어그로",
  midrange: "미드레인지",
  control: "컨트롤",
  combo: "콤보",
};

function getVariantClasses(variant: BadgeProps["variant"], value: string): string {
  switch (variant) {
    case "color":
      return colorMap[value] ?? "bg-gray-200 text-gray-700";
    case "tier":
      return tierMap[value] ?? "bg-gray-200 text-gray-700";
    case "difficulty":
      return difficultyMap[value] ?? "bg-gray-200 text-gray-700";
    case "playstyle":
      return "bg-gray-100 text-gray-700";
  }
}

function getDisplayLabel(variant: BadgeProps["variant"], value: string): string {
  switch (variant) {
    case "tier":
      return `Tier ${value}`;
    case "difficulty":
      return difficultyLabel[value] ?? value;
    case "playstyle":
      return playstyleLabel[value] ?? value;
    default:
      return value;
  }
}

export function Badge({ variant, value }: BadgeProps) {
  const classes = getVariantClasses(variant, value);
  const label = getDisplayLabel(variant, value);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${classes}`}
    >
      {label}
    </span>
  );
}
