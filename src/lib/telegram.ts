import WebApp from '@twa-dev/sdk'

export function initTelegramWebApp(): void {
  WebApp.ready()
  WebApp.expand()
}

export function getTelegramInitData(): string {
  return WebApp.initData ?? ''
}

export function getTelegramThemeClass(): string {
  return WebApp.colorScheme === 'dark' ? 'dark' : ''
}

export { WebApp }
