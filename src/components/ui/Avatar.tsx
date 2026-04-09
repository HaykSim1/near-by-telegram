import type { TelegramUserShape } from "../../types/models";

export function Avatar({
  user,
  size = 40,
}: {
  user: Pick<TelegramUserShape, "first_name" | "photo_url">;
  size?: number;
}) {
  const initial = user.first_name?.charAt(0)?.toUpperCase() ?? "?";
  if (user.photo_url) {
    return (
      <img
        className="avatar"
        src={user.photo_url}
        alt=""
        width={size}
        height={size}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="avatar avatar-fallback"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden
    >
      {initial}
    </div>
  );
}
