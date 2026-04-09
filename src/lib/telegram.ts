import WebApp from '@twa-dev/sdk'

export function initTelegramWebApp(): void {
  const wa = WebApp as { ready?: unknown; expand?: unknown }
  if (typeof wa.ready === 'function') (wa.ready as () => void)()
  if (typeof wa.expand === 'function') (wa.expand as () => void)()
}

export function getTelegramInitData(): string {
  return WebApp.initData ?? ''
}

export function getTelegramThemeClass(): string {
  return WebApp.colorScheme === 'dark' ? 'dark' : ''
}

export { WebApp }
