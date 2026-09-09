import { type FormEvent, useCallback, useEffect, useState } from "react";
import SettingsSidebar from "../../../../../../core/common/settings-sidebar/settingsSidebar";
import { useAuth } from "../../../../../../core/context/AuthContext";
import {
  createCurrency,
  listCurrencies,
  setCurrencyStatus,
  updateCurrency,
} from "../../../../../../core/services/firestore/clinic-lookups.service";
import type { CurrencyDoc } from "../../../../../../core/schemas/clinic-settings.schema";

const CurrenciesSettings = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<CurrencyDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [symbol, setSymbol] = useState("$");
  const [name, setName] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await listCurrencies("all"));
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
        await updateCurrency(
          editId,
          { code, symbol, name, isDefault, status: "active" },
          user?.uid
        );
      } else {
        await createCurrency(
          { code, symbol, name, isDefault, status: "active" },
          user?.uid
        );
      }
      setCode("");
      setSymbol("$");
      setName("");
      setIsDefault(false);
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
                  <h5 className="fw-bold">Currencies</h5>
                </div>
                <div className="card-body px-0 mx-3">
                  {error && <div className="alert alert-danger">{error}</div>}
                  <form className="row g-2 mb-4" onSubmit={(e) => void onSubmit(e)}>
                    <div className="col-md-2">
                      <input
                        className="form-control"
                        placeholder="Code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-2">
                      <input
                        className="form-control"
                        placeholder="Symbol"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <input
                        className="form-control"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-2 d-flex align-items-center">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={isDefault}
                          onChange={(e) => setIsDefault(e.target.checked)}
                          id="currency-default"
                        />
                        <label className="form-check-label" htmlFor="currency-default">
                          Default
                        </label>
                      </div>
                    </div>
                    <div className="col-md-2">
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
                          <th>Code</th>
                          <th>Symbol</th>
                          <th>Name</th>
                          <th>Default</th>
                          <th>Status</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r) => (
                          <tr key={r._id}>
                            <td>{r.code}</td>
                            <td>{r.symbol}</td>
                            <td>{r.name}</td>
                            <td>{r.isDefault ? "Yes" : "—"}</td>
                            <td>{r.status}</td>
                            <td className="text-end">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary me-1"
                                onClick={() => {
                                  setEditId(r._id);
                                  setCode(r.code);
                                  setSymbol(r.symbol);
                                  setName(r.name);
                                  setIsDefault(r.isDefault);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() =>
                                  void setCurrencyStatus(
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

export default CurrenciesSettings;
