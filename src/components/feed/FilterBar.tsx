import type { ActivityCategory, FeedGenderFilter, TimeScope } from "../../types/models";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "../../data/categories";
import { Chip } from "../ui/Chip";
import { useAppStore } from "../../store/appStore";

export function FilterBar() {
  const feedFilters = useAppStore((s) => s.feedFilters);
  const setFeedCategories = useAppStore((s) => s.setFeedCategories);
  const setMaxDistanceKm = useAppStore((s) => s.setMaxDistanceKm);
  const setFeedGender = useAppStore((s) => s.setFeedGender);
  const setFeedTimeScope = useAppStore((s) => s.setFeedTimeScope);

  const toggleCategory = (c: ActivityCategory) => {
    const next = new Set(feedFilters.categories);
    if (next.has(c)) next.delete(c);
    else next.add(c);
    setFeedCategories(next);
  };

  return (
    <div className="filter-bar">
      <div className="filter-section">
        <div className="filter-label">Category</div>
        <div className="filter-row">
          {CATEGORY_ORDER.map((c) => (
            <Chip
              key={c}
              selected={feedFilters.categories.has(c)}
              onClick={() => toggleCategory(c)}
            >
              {CATEGORY_LABELS[c]}
            </Chip>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-label">Max distance</div>
        <div className="filter-row">
          {[2, 5, 10, 25].map((km) => (
            <Chip
              key={km}
              selected={feedFilters.maxDistanceKm === km}
              onClick={() => setMaxDistanceKm(km)}
            >
              {km} km
            </Chip>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-label">Gender (host)</div>
        <div className="filter-row">
          {(
            [
              ["any", "Any"],
              ["male", "Male"],
              ["female", "Female"],
              ["nonbinary", "Non-binary"],
            ] as const
          ).map(([v, label]) => (
            <Chip
              key={v}
              selected={feedFilters.gender === v}
              onClick={() => setFeedGender(v as FeedGenderFilter)}
            >
              {label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-label">When</div>
        <div className="filter-row">
          {(
            [
              ["both", "All"],
              ["now", "Now"],
              ["today", "Today"],
            ] as const
          ).map(([v, label]) => (
            <Chip
              key={v}
              selected={feedFilters.timeScope === v}
              onClick={() =>
                setFeedTimeScope(v as TimeScope | "both")
              }
            >
              {label}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}
