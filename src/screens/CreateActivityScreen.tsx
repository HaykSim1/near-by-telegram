import { useState } from "react";
import type { Activity, ActivityCategory, TimeScope } from "../types/models";
import { ScreenHeader } from "../components/layout/ScreenHeader";
import { Button } from "../components/ui/Button";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "../data/categories";
import { useAppStore, buildActivityFromForm } from "../store/appStore";

const DISTRICTS = [
  "Kentron",
  "Arabkir",
  "Near Cascade",
  "Komitas",
  "Malatia-Sebastia",
  "City Center",
];

export function CreateActivityScreen() {
  const closeOverlay = useAppStore((s) => s.closeOverlay);
  const publishActivity = useAppStore((s) => s.publishActivity);
  const telegramUser = useAppStore((s) => s.telegramUser);
  const viewerDistrict = useAppStore((s) => s.viewerDistrict);

  const [category, setCategory] = useState<ActivityCategory>("coffee");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [district, setDistrict] = useState(viewerDistrict);
  const [timeScope, setTimeScope] = useState<TimeScope>("now");
  const [validity, setValidity] = useState<"now" | "today" | "custom">("now");
  const [customHours, setCustomHours] = useState(3);
  const [prefGender, setPrefGender] = useState<Activity["preferredGender"]>("any");
  const [ageMin, setAgeMin] = useState<string>("");
  const [ageMax, setAgeMax] = useState<string>("");

  const canPublish = title.trim().length >= 3 && district.trim().length > 0;

  const handlePublish = () => {
    if (!canPublish) return;
    const payload = buildActivityFromForm({
      authorId: telegramUser.id,
      category,
      title,
      description,
      districtLabel: district,
      timeScope,
      validity,
      customHours: validity === "custom" ? customHours : undefined,
      preferredGender: prefGender,
      ageMin: ageMin ? Number(ageMin) : undefined,
      ageMax: ageMax ? Number(ageMax) : undefined,
    });
    publishActivity(payload);
  };

  return (
    <div className="overlay-screen">
      <ScreenHeader title="New activity" showBack onBack={closeOverlay} />
      <div className="overlay-body">
        <div className="form-field">
          <label htmlFor="cat">Category</label>
          <select
            id="cat"
            value={category}
            onChange={(e) => setCategory(e.target.value as ActivityCategory)}
          >
            {CATEGORY_ORDER.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Coffee near Opera in 20 min?"
          />
        </div>
        <div className="form-field">
          <label htmlFor="desc">Short description</label>
          <textarea
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What, where roughly, any constraints…"
          />
        </div>
        <div className="form-field">
          <label htmlFor="dist">District / neighborhood</label>
          <select
            id="dist"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          >
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label>Time focus</label>
          <select
            value={timeScope}
            onChange={(e) => setTimeScope(e.target.value as TimeScope)}
          >
            <option value="now">Now</option>
            <option value="today">Today</option>
          </select>
        </div>
        <div className="form-field">
          <label>Valid until</label>
          <select
            value={validity}
            onChange={(e) =>
              setValidity(e.target.value as "now" | "today" | "custom")
            }
          >
            <option value="now">~1 hour (now)</option>
            <option value="today">End of today</option>
            <option value="custom">Custom hours</option>
          </select>
        </div>
        {validity === "custom" ? (
          <div className="form-field">
            <label htmlFor="hours">Hours from now</label>
            <input
              id="hours"
              type="number"
              min={1}
              max={48}
              value={customHours}
              onChange={(e) => setCustomHours(Number(e.target.value) || 1)}
            />
          </div>
        ) : null}
        <div className="form-field">
          <label>Approx. distance (preview)</label>
          <input readOnly value="Shown to others as approximate (mock)" />
        </div>
        <div className="form-field">
          <label>Preferred responder gender</label>
          <select
            value={prefGender ?? "any"}
            onChange={(e) =>
              setPrefGender(e.target.value as Activity["preferredGender"])
            }
          >
            <option value="any">No preference</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="nonbinary">Non-binary</option>
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="amin">Age min (optional)</label>
          <input
            id="amin"
            inputMode="numeric"
            value={ageMin}
            onChange={(e) => setAgeMin(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="amax">Age max (optional)</label>
          <input
            id="amax"
            inputMode="numeric"
            value={ageMax}
            onChange={(e) => setAgeMax(e.target.value)}
          />
        </div>
        <Button variant="primary" disabled={!canPublish} onClick={handlePublish}>
          Publish
        </Button>
      </div>
    </div>
  );
}
