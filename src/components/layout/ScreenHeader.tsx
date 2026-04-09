import { BackButton } from "@twa-dev/sdk/react";
import type { ReactNode } from "react";

export function ScreenHeader({
  title,
  showBack,
  onBack,
  right,
}: {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: ReactNode;
}) {
  return (
    <header className="screen-header">
      {showBack ? <BackButton onClick={onBack} /> : <span style={{ width: 0 }} />}
      <h1 style={{ flex: 1 }}>{title}</h1>
      {right ?? <span style={{ width: 28 }} />}
    </header>
  );
}
