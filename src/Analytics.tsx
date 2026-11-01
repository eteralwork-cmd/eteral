// src/Analytics.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global { interface Window { gtag?: (...args: any[]) => void } }
export function track(event: string, params: Record<string, any> = {}) {
  try {
    (window as any).gtag?.("event", event, params);
  } catch {}
}

export default function Analytics() {
  const location = useLocation();
  useEffect(() => {
    window.gtag?.("event", "page_view", {
      page_path: location.pathname + location.search,
      page_location: window.location.href,
    });
  }, [location]);
  return null;
}