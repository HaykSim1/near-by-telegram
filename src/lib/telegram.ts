import WebApp from '@twa-dev/sdk'

type TgWin = Window & { Telegram?: { WebApp?: { initData?: string; colorScheme?: string } } }

function webAppFromWindow() {
  return (window as TgWin).Telegram?.WebApp
}

export function initTelegramWebApp(): void {
  const wa = (webAppFromWindow() ?? WebApp) as { ready?: unknown; expand?: unknown }
  if (typeof wa.ready === 'function') (wa.ready as () => void)()
  if (typeof wa.expand === 'function') (wa.expand as () => void)()
}

/** Prefer live `window.Telegram.WebApp.initData` (Telegram can set it after load). */
export function getTelegramInitData(): string {
  const direct = webAppFromWindow()?.initData
  if (typeof direct === 'string' && direct.length > 0) return direct
  return WebApp.initData ?? ''
}

export function getTelegramThemeClass(): string {
  const scheme = webAppFromWindow()?.colorScheme ?? WebApp.colorScheme
  return scheme === 'dark' ? 'dark' : ''
}

export { WebApp }
