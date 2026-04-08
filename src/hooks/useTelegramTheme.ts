import { useEffect } from "react";
import { WebApp } from "../lib/telegram";

export function useTelegramTheme(): void {
  useEffect(() => {
    const root = document.documentElement;
    const t = WebApp.themeParams;
    const set = (key: string, value: string | undefined) => {
      if (value) root.style.setProperty(key, value);
    };
    set("--tg-theme-bg-color", t.bg_color);
    set("--tg-theme-text-color", t.text_color);
    set("--tg-theme-hint-color", t.hint_color);
    set("--tg-theme-link-color", t.link_color);
    set("--tg-theme-button-color", t.button_color);
    set("--tg-theme-button-text-color", t.button_text_color);
    set("--tg-theme-secondary-bg-color", t.secondary_bg_color);

    if (WebApp.colorScheme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.setAttribute("data-theme", "light");
    }
  }, []);
}
