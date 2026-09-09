import { useCallback, useEffect, useState } from "react";
import { listPayroll } from "../../../../../core/services/firestore/payroll.service";
import type { PayrollDoc } from "../../../../../core/schemas/payroll.schema";
import type { PayrollStatus } from "../../../../../core/types/payroll.types";

export function usePayroll(extras: { staffUserId?: string } = {}) {
  const [payrolls, setPayrolls] = useState<PayrollDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<PayrollStatus | "all">("all");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listPayroll({
        pageSize: 50,
        staffUserId: extras.staffUserId,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setPayrolls(result.payrolls as unknown as PayrollDoc[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payroll");
    } finally {
      setLoading(false);
    }
  }, [extras.staffUserId, statusFilter]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { payrolls, loading, error, statusFilter, setStatusFilter, refresh };
}
