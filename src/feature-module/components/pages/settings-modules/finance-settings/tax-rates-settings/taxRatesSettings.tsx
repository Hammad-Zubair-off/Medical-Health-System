import { type FormEvent, useCallback, useEffect, useState } from "react";
import SettingsSidebar from "../../../../../../core/common/settings-sidebar/settingsSidebar";
import { useAuth } from "../../../../../../core/context/AuthContext";
import {
  createTaxRate,
  listTaxRates,
  setTaxRateStatus,
  updateTaxRate,
} from "../../../../../../core/services/firestore/clinic-lookups.service";
import type { TaxRateDoc } from "../../../../../../core/schemas/clinic-settings.schema";

const TaxRatesSettings = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<TaxRateDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [ratePercent, setRatePercent] = useState(0);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await listTaxRates("all"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editId) {
        await updateTaxRate(editId, { name, ratePercent, status: "active" }, user?.uid);
      } else {
        await createTaxRate({ name, ratePercent, status: "active" }, user?.uid);
      }
      setName("");
      setRatePercent(0);
      setEditId(null);
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
                  <h5 className="fw-bold">Tax Rates</h5>
                </div>
                <div className="card-body px-0 mx-3">
                  {error && <div className="alert alert-danger">{error}</div>}
                  <form className="row g-2 mb-4" onSubmit={(e) => void onSubmit(e)}>
                    <div className="col-md-5">
                      <input
                        className="form-control"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        placeholder="Rate %"
                        value={ratePercent}
                        onChange={(e) => setRatePercent(Number(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-md-4">
                      <button type="submit" className="btn btn-primary" disabled={saving}>
                        {editId ? "Update" : "Add"}
                      </button>
                    </div>
                  </form>
                  {loading ? (
                    <p>Loading…</p>
                  ) : (
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Rate %</th>
                          <th>Status</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r) => (
                          <tr key={r._id}>
                            <td>{r.name}</td>
                            <td>{r.ratePercent}</td>
                            <td>{r.status}</td>
                            <td className="text-end">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary me-1"
                                onClick={() => {
                                  setEditId(r._id);
                                  setName(r.name);
                                  setRatePercent(r.ratePercent);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() =>
                                  void setTaxRateStatus(
                                    r._id,
                                    r.status === "active" ? "inactive" : "active",
                                    user?.uid
                                  ).then(refresh)
                                }
                              >
                                {r.status === "active" ? "Deactivate" : "Activate"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

export default TaxRatesSettings;
