import { useCallback, useState } from "react";

export interface MockLocationState {
  district: string;
  /** Whether browser geolocation was granted (we still only use district label in UI). */
  geoRequested: boolean;
  geoGranted: boolean;
}

const FALLBACK_DISTRICT = "Kentron";

export function useMockLocation() {
  const [state, setState] = useState<MockLocationState>({
    district: FALLBACK_DISTRICT,
    geoRequested: false,
    geoGranted: false,
  });

  const setDistrict = useCallback((district: string) => {
    setState((s) => ({ ...s, district }));
  }, []);

  const requestGeolocation = useCallback((onDone?: (district: string) => void) => {
    setState((s) => ({ ...s, geoRequested: true }));
    if (!navigator.geolocation) {
      setState((s) => ({
        ...s,
        geoGranted: false,
        district: FALLBACK_DISTRICT,
      }));
      onDone?.(FALLBACK_DISTRICT);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        const districts = [
          "Kentron",
          "Arabkir",
          "Near Cascade",
          "Komitas",
          "Malatia-Sebastia",
        ];
        const pick =
          districts[Math.floor(Math.random() * districts.length)] ??
          FALLBACK_DISTRICT;
        setState({
          geoRequested: true,
          geoGranted: true,
          district: pick,
        });
        onDone?.(pick);
      },
      () => {
        setState({
          geoRequested: true,
          geoGranted: false,
          district: FALLBACK_DISTRICT,
        });
        onDone?.(FALLBACK_DISTRICT);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  }, []);

  return { ...state, requestGeolocation, setDistrict };
}
