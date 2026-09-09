import { type FormEvent, useCallback, useEffect, useState } from "react";
import SettingsSidebar from "../../../../../../core/common/settings-sidebar/settingsSidebar";
import { useAuth } from "../../../../../../core/context/AuthContext";
import {
  createCancellationReason,
  listCancellationReasons,
  setCancellationReasonStatus,
  updateCancellationReason,
} from "../../../../../../core/services/firestore/clinic-lookups.service";
import type { CancellationReasonDoc } from "../../../../../../core/schemas/clinic-settings.schema";

const CancellationReasonSettings = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<CancellationReasonDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await listCancellationReasons("all"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reasons");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const resetForm = () => {
    setLabel("");
    setSortOrder(0);
    setEditId(null);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    setSaving(true);
    setError(null);
    try {
      if (editId) {
        await updateCancellationReason(
          editId,
          { label, sortOrder, status: "active" },
          user?.uid
        );
      } else {
        await createCancellationReason(
          { label, sortOrder, status: "active" },
          user?.uid
        );
      }
      resetForm();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="mb-3 border-bottom pb-3">
          <h4 className="fw-bold mb-0">Settings</h4>
        </div>
        <div className="card">
          <div className="card-body p-0">
            <div className="settings-wrapper d-flex">
              <SettingsSidebar />
              <div className="card flex-fill mb-0 border-0 bg-light-500 shadow-none">
                <div className="card-header border-bottom px-0 mx-3">
                  <h5 className="fw-bold">Cancellation Reasons</h5>
                </div>
                <div className="card-body px-0 mx-3">
                  {error && <div className="alert alert-danger">{error}</div>}
                  <form className="row g-2 mb-4" onSubmit={(e) => void onSubmit(e)}>
                    <div className="col-md-6">
                      <input
                        className="form-control"
                        placeholder="Reason label"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-2">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Sort"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-md-4 d-flex gap-2">
                      <button type="submit" className="btn btn-primary" disabled={saving}>
                        {editId ? "Update" : "Add"}
                      </button>
                      {editId && (
                        <button type="button" className="btn btn-light" onClick={resetForm}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                  {loading ? (
                    <p>Loading…</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Reason</th>
                            <th>Sort</th>
                            <th>Status</th>
                            <th />
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((r) => (
                            <tr key={r._id}>
                              <td>{r.label}</td>
                              <td>{r.sortOrder}</td>
                              <td>{r.status}</td>
                              <td className="text-end">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary me-1"
                                  onClick={() => {
                                    setEditId(r._id);
                                    setLabel(r.label);
                                    setSortOrder(r.sortOrder);
                                  }}
                                >
                                  Edit
                                </button>
                                {r.status === "active" ? (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() =>
                                      void setCancellationReasonStatus(
                                        r._id,
                                        "inactive",
                                        user?.uid
                                      ).then(refresh)
                                    }
                                  >
                                    Deactivate
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-success"
                                    onClick={() =>
                                      void setCancellationReasonStatus(
                                        r._id,
                                        "active",
                                        user?.uid
                                      ).then(refresh)
                                    }
                                  >
                                    Activate
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancellationReasonSettings;
