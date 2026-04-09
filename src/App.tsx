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
import { isSupabaseConfigured } from "./lib/supabaseClient";
import { pullRemoteState, subscribeRemoteSync } from "./lib/remoteSync";
import {
  fetchRemoteUserSettings,
  remoteUserSettingsStatePatch,
} from "./lib/userSettingsSync";
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

  /** Pull shared feed as soon as localStorage rehydration finishes (not only after onboarding). */
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const run = () => void pullRemoteState();
    const unsub = useAppStore.persist.onFinishHydration(run);
    if (useAppStore.persist.hasHydrated()) run();
    return unsub;
  }, []);

  const telegramUserId = useAppStore((s) => s.telegramUser.id);

  /** Load server onboarding / profile after localStorage merge so server state is not overwritten by rehydration. */
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const applyRemoteSettings = () => {
      const u = useAppStore.getState().telegramUser;
      void fetchRemoteUserSettings(u.id, u).then((remote) => {
        if (!remote) return;
        useAppStore.setState((s) => {
          const patch = remoteUserSettingsStatePatch(u, remote);
          return {
            onboardingComplete: patch.onboardingComplete,
            viewerDistrict: patch.viewerDistrict,
            profiles: { ...s.profiles, ...patch.profiles },
          };
        });
      });
    };
    if (useAppStore.persist.hasHydrated()) {
      applyRemoteSettings();
      return;
    }
    return useAppStore.persist.onFinishHydration(applyRemoteSettings);
  }, [telegramUserId]);

  const onboardingComplete = useAppStore((s) => s.onboardingComplete);

  useEffect(() => {
    if (!onboardingComplete || !isSupabaseConfigured()) return;
    void pullRemoteState();
    return subscribeRemoteSync();
  }, [onboardingComplete]);
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
