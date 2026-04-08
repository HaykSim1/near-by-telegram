import { useEffect } from "react";
import { useTelegramTheme } from "./hooks/useTelegramTheme";
import { defaultProfile } from "./data/seed";
import { getTelegramUser, initTelegramWebApp } from "./lib/telegram";
import { AppShell } from "./components/layout/AppShell";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { FeedScreen } from "./screens/FeedScreen";
import { MyActivitiesScreen } from "./screens/MyActivitiesScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { CreateActivityScreen } from "./screens/CreateActivityScreen";
import { ActivityDetailScreen } from "./screens/ActivityDetailScreen";
import { ResponsesScreen } from "./screens/ResponsesScreen";
import { useAppStore } from "./store/appStore";
import "./App.css";

export default function App() {
  useTelegramTheme();

  useEffect(() => {
    initTelegramWebApp();
    const u = getTelegramUser();
    useAppStore.setState((s) => ({
      telegramUser: u,
      profiles: {
        ...s.profiles,
        [u.id]: s.profiles[u.id] ?? defaultProfile(u),
      },
    }));
  }, []);

  const onboardingComplete = useAppStore((s) => s.onboardingComplete);
  const overlay = useAppStore((s) => s.overlay);
  const mainTab = useAppStore((s) => s.mainTab);

  if (!onboardingComplete) {
    return <OnboardingScreen />;
  }

  const overlayOpen = overlay !== null;

  return (
    <>
      <AppShell hideNav={overlayOpen}>
        {mainTab === "feed" ? <FeedScreen /> : null}
        {mainTab === "myActivities" ? <MyActivitiesScreen /> : null}
        {mainTab === "profile" ? <ProfileScreen /> : null}
      </AppShell>
      {overlay === "create" ? <CreateActivityScreen /> : null}
      {overlay && typeof overlay === "object" && overlay.type === "detail" ? (
        <ActivityDetailScreen activityId={overlay.activityId} />
      ) : null}
      {overlay && typeof overlay === "object" && overlay.type === "responses" ? (
        <ResponsesScreen activityId={overlay.activityId} />
      ) : null}
    </>
  );
}
