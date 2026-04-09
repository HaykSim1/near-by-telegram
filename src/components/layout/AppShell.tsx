import { NavLink, Outlet } from 'react-router-dom'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium ${
    isActive ? 'text-[var(--tg-theme-link-color,#2481cc)]' : 'text-[var(--tg-theme-hint-color,#999)]'
  }`

export function AppShell() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-[var(--tg-theme-bg-color,#fff)] text-[var(--tg-theme-text-color,#000)]">
      <main className="flex-1 overflow-y-auto px-4 pb-24 pt-3">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 flex border-t border-[var(--tg-theme-secondary-bg-color,#eee)] bg-[var(--tg-theme-bg-color,#fff)] safe-area-pb">
        <NavLink to="/" end className={linkClass}>
          <span className="text-lg" aria-hidden>
            ◎
          </span>
          Feed
        </NavLink>
        <NavLink to="/create" className={linkClass}>
          <span className="text-lg" aria-hidden>
            ＋
          </span>
          Create
        </NavLink>
        <NavLink to="/my-activities" className={linkClass}>
          <span className="text-lg" aria-hidden>
            ≡
          </span>
          Mine
        </NavLink>
        <NavLink to="/profile" className={linkClass}>
          <span className="text-lg" aria-hidden>
            ◉
          </span>
          Profile
        </NavLink>
      </nav>
    </div>
  )
}
