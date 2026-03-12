"use client";

interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const variantClasses: Record<string, string> = {
  primary:
    "bg-op-red text-white hover:brightness-110 active:brightness-90 border-transparent shadow-md",
  secondary:
    "bg-transparent text-op-red border-op-red hover:bg-op-red/10 active:bg-op-red/20",
  ghost:
    "bg-transparent text-gray-700 border-transparent hover:bg-gray-100 active:bg-gray-200",
};

const sizeClasses: Record<string, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-base",
  lg: "h-14 px-7 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  onClick,
  disabled = false,
  className = "",
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-lg border-2 font-semibold transition-all duration-200 ease-out cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-op-red min-w-[44px] min-h-[44px]";
  const disabledClass = disabled
    ? "opacity-40 cursor-not-allowed pointer-events-none"
    : "";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClass} ${className}`}
    >
      {children}
    </button>
  );
}
