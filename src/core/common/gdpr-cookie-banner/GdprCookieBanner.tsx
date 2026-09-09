import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { getClinicSettings } from "../../services/firestore/clinic-settings.service";

const STORAGE_KEY = "preclinic_gdpr_accepted";

/**
 * Shows a cookie banner when ClinicSettings.gdpr.enabled is true and the
 * visitor has not accepted yet (localStorage).
 * Re-checks on route change so enabling GDPR in Settings shows the banner
 * without a full remount.
 */
const GdprCookieBanner = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState("");
  const [position, setPosition] = useState<"bottom" | "top" | "left" | "right">(
    "bottom"
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY) === "1") {
      setVisible(false);
      return;
    }
    let cancelled = false;
    void getClinicSettings()
      .then((s) => {
        if (cancelled) return;
        if (s.gdpr.enabled) {
          setText(s.gdpr.bannerText);
          setPosition(s.gdpr.position);
          setVisible(true);
        } else {
          setVisible(false);
        }
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  if (!visible) return null;

  const style: React.CSSProperties =
    position === "top"
      ? { top: 0, left: 0, right: 0 }
      : position === "left"
        ? { left: 0, top: "30%", maxWidth: 320 }
        : position === "right"
          ? { right: 0, top: "30%", maxWidth: 320 }
          : { bottom: 0, left: 0, right: 0 };

  return (
    <div
      className="bg-dark text-white p-3 shadow"
      style={{ position: "fixed", zIndex: 1080, ...style }}
      data-testid="gdpr-banner"
    >
      <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
        <p className="mb-0 fs-13">{text}</p>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={() => {
            localStorage.setItem(STORAGE_KEY, "1");
            setVisible(false);
          }}
        >
          Accept
        </button>
      </div>
    </div>
  );
};

export default GdprCookieBanner;
