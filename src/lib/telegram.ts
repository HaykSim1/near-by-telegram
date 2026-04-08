import WebApp from "@twa-dev/sdk";
import type { TelegramUserShape } from "../types/models";
import { createDevUser } from "../data/seed";

export function initTelegramWebApp(): void {
  WebApp.ready();
  WebApp.expand();
}

export function getTelegramUser(): TelegramUserShape {
  const u = WebApp.initDataUnsafe?.user;
  if (u?.id) {
    return {
      id: u.id,
      first_name: u.first_name,
      last_name: u.last_name,
      username: u.username,
      photo_url: u.photo_url,
    };
  }
  return createDevUser();
}

export function isTelegramEnvironment(): boolean {
  return Boolean(WebApp.initDataUnsafe?.user?.id);
}

export function openTelegramUsername(username: string): void {
  const handle = username.replace(/^@/, "");
  const url = `https://t.me/${handle}`;
  try {
    WebApp.openLink(url);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export function showTelegramAlert(message: string): void {
  try {
    WebApp.showAlert(message);
  } catch {
    window.alert(message);
  }
}

export { WebApp };
