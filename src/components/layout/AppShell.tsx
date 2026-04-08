import type { MainTab } from "../../types/models";
import { useAppStore } from "../../store/appStore";

const tabs: { id: MainTab; label: string }[] = [
  { id: "feed", label: "Nearby" },
  { id: "myActivities", label: "My activities" },
  { id: "profile", label: "Profile" },
];

export function AppShell({
  children,
  hideNav,
}: {
  children: React.ReactNode;
  hideNav?: boolean;
}) {
  const mainTab = useAppStore((s) => s.mainTab);
  const setMainTab = useAppStore((s) => s.setMainTab);

  return (
    <div className="app-shell">
      <main className={`app-main ${hideNav ? "app-main-no-pad-bottom" : ""}`}>{children}</main>
      {!hideNav ? (
      <nav className="bottom-nav" aria-label="Main">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={mainTab === t.id ? "active" : ""}
            onClick={() => setMainTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
      ) : null}
    </div>
  );
}
