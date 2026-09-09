import { useEffect, useState } from "react";
import { getPrescription } from "../../../../../../core/services/firestore/prescription.service";
import type { PrescriptionDoc } from "../../../../../../core/schemas/prescription.schema";

export function usePrescription(id: string | undefined) {
  const [prescription, setPrescription] = useState<PrescriptionDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void getPrescription(id)
      .then((doc) => {
        if (cancelled) return;
        if (!doc) {
          setNotFound(true);
          setPrescription(null);
        } else {
          setNotFound(false);
          setPrescription(doc);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          // Missing docs / permission → treat as not found for detail 404 UX
          const msg =
            err instanceof Error ? err.message : "Failed to load prescription";
          if (/not.?found|permission|insufficient|Missing/i.test(msg)) {
            setNotFound(true);
          } else {
            setError(msg);
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { prescription, loading, error, notFound };
}
