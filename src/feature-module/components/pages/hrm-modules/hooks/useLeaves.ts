import { useCallback, useEffect, useState } from "react";
import {
  listLeaves,
  listLeaveTypes,
} from "../../../../../core/services/firestore/leave.service";
import type { LeaveDoc, LeaveTypeDoc } from "../../../../../core/schemas/leave.schema";
import type { LeaveStatus } from "../../../../../core/types/leave.types";

export function useLeaveTypes() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listLeaveTypes({ pageSize: 50 });
      setLeaveTypes(result.leaveTypes as unknown as LeaveTypeDoc[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leave types");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { leaveTypes, loading, error, refresh };
}

export function useLeaves(extras: {
  staffUserId?: string;
  staffId?: string;
  status?: LeaveStatus;
} = {}) {
  const [leaves, setLeaves] = useState<LeaveDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listLeaves({
        pageSize: 50,
        staffUserId: extras.staffUserId,
        staffId: extras.staffId,
        status: extras.status,
      });
      setLeaves(result.leaves as unknown as LeaveDoc[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leaves");
    } finally {
      setLoading(false);
    }
  }, [extras.staffUserId, extras.staffId, extras.status]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { leaves, loading, error, refresh };
}
