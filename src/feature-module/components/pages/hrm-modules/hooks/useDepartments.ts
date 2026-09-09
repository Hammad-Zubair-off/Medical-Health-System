import { useCallback, useEffect, useState } from "react";
import {
  listDepartments,
  listDesignations,
} from "../../../../../core/services/firestore/department.service";
import type { DepartmentDoc, DesignationDoc } from "../../../../../core/schemas/department.schema";

export function useDepartments() {
  const [departments, setDepartments] = useState<DepartmentDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listDepartments({ pageSize: 50 });
      setDepartments(result.departments as unknown as DepartmentDoc[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load departments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { departments, loading, error, refresh };
}

export function useDesignations() {
  const [designations, setDesignations] = useState<DesignationDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listDesignations({ pageSize: 50 });
      setDesignations(result.designations as unknown as DesignationDoc[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load designations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { designations, loading, error, refresh };
}
