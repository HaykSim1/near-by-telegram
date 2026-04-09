import type { ReactNode } from "react";

export function Chip({
  selected,
  onClick,
  children,
}: {
  selected?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`chip ${selected ? "chip-selected" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
