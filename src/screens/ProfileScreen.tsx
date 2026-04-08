import { ScreenHeader } from "../components/layout/ScreenHeader";
import { Avatar } from "../components/ui/Avatar";
import { useAppStore } from "../store/appStore";

export function ProfileScreen() {
  const telegramUser = useAppStore((s) => s.telegramUser);
  const profile = useAppStore((s) => s.profiles[s.telegramUser.id]);
  const updateMyProfile = useAppStore((s) => s.updateMyProfile);

  if (!profile) return null;

  return (
    <>
      <ScreenHeader title="Profile" />
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
        <Avatar user={telegramUser} size={64} />
        <div>
          <div style={{ fontWeight: 700, fontSize: "1.15rem" }}>
            {telegramUser.first_name} {telegramUser.last_name ?? ""}
          </div>
          {telegramUser.username ? (
            <div style={{ fontSize: "0.85rem", color: "var(--tg-theme-hint-color)" }}>
              @{telegramUser.username}
            </div>
          ) : null}
        </div>
      </div>
      <div className="form-field">
        <label htmlFor="age">Age</label>
        <input
          id="age"
          inputMode="numeric"
          value={profile.age ?? ""}
          onChange={(e) =>
            updateMyProfile({
              age: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          placeholder="Optional"
        />
      </div>
      <div className="form-field">
        <label htmlFor="bio">Short bio</label>
        <textarea
          id="bio"
          value={profile.bio}
          onChange={(e) => updateMyProfile({ bio: e.target.value })}
          placeholder="A line about what you like to do nearby…"
        />
      </div>
      <div className="form-field">
        <label htmlFor="interests">Interests (comma-separated)</label>
        <input
          id="interests"
          value={profile.interests.join(", ")}
          onChange={(e) =>
            updateMyProfile({
              interests: e.target.value
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean),
            })
          }
          placeholder="Coffee, hiking, startups…"
        />
      </div>
      <div className="filter-label" style={{ marginTop: 24 }}>
        Privacy
      </div>
      <label className="toggle-row">
        <span>Show approximate distance on my cards</span>
        <input
          type="checkbox"
          checked={profile.privacy.showApproximateDistance}
          onChange={(e) =>
            updateMyProfile({
              privacy: { ...profile.privacy, showApproximateDistance: e.target.checked },
            })
          }
        />
      </label>
      <label className="toggle-row">
        <span>Show district / neighborhood on my cards</span>
        <input
          type="checkbox"
          checked={profile.privacy.showDistrict}
          onChange={(e) =>
            updateMyProfile({
              privacy: { ...profile.privacy, showDistrict: e.target.checked },
            })
          }
        />
      </label>
    </>
  );
}
