import { Button } from "../components/ui/Button";
import { useAppStore } from "../store/appStore";
import { useMockLocation } from "../hooks/useMockLocation";

export function OnboardingScreen() {
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete);
  const setViewerDistrict = useAppStore((s) => s.setViewerDistrict);
  const { requestGeolocation } = useMockLocation();

  const handleStart = () => {
    requestGeolocation((d) => {
      setViewerDistrict(d);
      setOnboardingComplete(true);
    });
  };

  return (
    <div className="onboarding">
      <div className="onboarding-inner">
        <h1 className="onboarding-title">Nearby Now</h1>
        <p className="onboarding-lead">
          See who’s around and what they want to do <strong>right now</strong>—coffee,
          a walk, coworking, sport, quick help, or a short brainstorm. Intent-first,
          not dating.
        </p>
        <ul className="onboarding-bullets">
          <li>Approximate distance and neighborhood only—never an exact pin.</li>
          <li>Chat in Telegram opens after someone accepts your response.</li>
        </ul>
        <Button variant="primary" onClick={handleStart}>
          Start
        </Button>
        <p className="onboarding-footnote">
          We’ll ask for location once to pick a rough area (or use a demo area if you
          decline).
        </p>
      </div>
    </div>
  );
}
