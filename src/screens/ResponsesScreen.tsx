import { ScreenHeader } from "../components/layout/ScreenHeader";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { useAppStore } from "../store/appStore";
import { openTelegramUsername, showTelegramAlert } from "../lib/telegram";

export function ResponsesScreen({ activityId }: { activityId: string }) {
  const closeOverlay = useAppStore((s) => s.closeOverlay);
  const getActivity = useAppStore((s) => s.getActivity);
  const getUser = useAppStore((s) => s.getUser);
  const getResponsesForActivity = useAppStore((s) => s.getResponsesForActivity);
  const acceptResponse = useAppStore((s) => s.acceptResponse);
  const declineResponse = useAppStore((s) => s.declineResponse);
  const telegramUser = useAppStore((s) => s.telegramUser);

  const activity = getActivity(activityId);
  const list = getResponsesForActivity(activityId);

  if (!activity || activity.authorId !== telegramUser.id) {
    return (
      <div className="overlay-screen">
        <ScreenHeader title="Responses" showBack onBack={closeOverlay} />
        <p className="empty-state">You can only manage responses to your own activities.</p>
      </div>
    );
  }

  return (
    <div className="overlay-screen">
      <ScreenHeader title="Responses" showBack onBack={closeOverlay} />
      <div className="overlay-body">
        <p style={{ fontSize: "0.9rem", color: "var(--tg-theme-hint-color)", marginTop: 0 }}>
          {activity.title}
        </p>
        {list.length === 0 ? (
          <p className="empty-state">No responses yet.</p>
        ) : (
          list.map((r) => {
            const u = getUser(r.fromUserId);
            if (!u) return null;
            return (
              <div key={r.id} className="response-row">
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <Avatar user={u} size={44} />
                  <div>
                    <div style={{ fontWeight: 650 }}>{u.first_name}</div>
                    {u.username ? (
                      <div style={{ fontSize: "0.82rem", color: "var(--tg-theme-hint-color)" }}>
                        @{u.username}
                      </div>
                    ) : null}
                    {r.message ? (
                      <div style={{ fontSize: "0.88rem", marginTop: 6 }}>{r.message}</div>
                    ) : null}
                  </div>
                </div>
                {r.status === "pending" ? (
                  <div className="response-row-actions">
                    <Button
                      variant="secondary"
                      onClick={() => void declineResponse(r.id)}
                    >
                      Decline
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => void acceptResponse(r.id)}
                    >
                      Accept
                    </Button>
                  </div>
                ) : null}
                {r.status === "accepted" ? (
                  <div style={{ marginTop: 12 }}>
                    <Button
                      variant="primary"
                      onClick={() => {
                        if (u.username) openTelegramUsername(u.username);
                        else
                          showTelegramAlert(
                            "This user has no public Telegram username in the demo.",
                          );
                      }}
                    >
                      Open Telegram chat
                    </Button>
                  </div>
                ) : null}
                {r.status === "declined" ? (
                  <div style={{ fontSize: "0.82rem", color: "var(--tg-theme-hint-color)", marginTop: 8 }}>
                    Declined
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
