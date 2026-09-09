import { type FormEvent, useCallback, useEffect, useState } from "react";
import SettingsSidebar from "../../../../../../core/common/settings-sidebar/settingsSidebar";
import { useAuth } from "../../../../../../core/context/AuthContext";
import {
  createBankAccount,
  listBankAccounts,
  setBankAccountStatus,
  updateBankAccount,
} from "../../../../../../core/services/firestore/clinic-lookups.service";
import type { BankAccountDoc } from "../../../../../../core/schemas/clinic-settings.schema";

const BankAccountsSettings = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<BankAccountDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountName, setAccountName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await listBankAccounts("all"));
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
        await updateBankAccount(
          editId,
          { accountName, bankName, accountNumber, status: "active" },
          user?.uid
        );
      } else {
        await createBankAccount(
          { accountName, bankName, accountNumber, status: "active" },
          user?.uid
        );
      }
      setAccountName("");
      setBankName("");
      setAccountNumber("");
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
                  <h5 className="fw-bold">Bank Accounts</h5>
                </div>
                <div className="card-body px-0 mx-3">
                  {error && <div className="alert alert-danger">{error}</div>}
                  <form className="row g-2 mb-4" onSubmit={(e) => void onSubmit(e)}>
                    <div className="col-md-3">
                      <input
                        className="form-control"
                        placeholder="Account name"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <input
                        className="form-control"
                        placeholder="Bank"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <input
                        className="form-control"
                        placeholder="Account number"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-3">
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
                          <th>Account</th>
                          <th>Bank</th>
                          <th>Number</th>
                          <th>Status</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r) => (
                          <tr key={r._id}>
                            <td>{r.accountName}</td>
                            <td>{r.bankName}</td>
                            <td>{r.accountNumber}</td>
                            <td>{r.status}</td>
                            <td className="text-end">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary me-1"
                                onClick={() => {
                                  setEditId(r._id);
                                  setAccountName(r.accountName);
                                  setBankName(r.bankName);
                                  setAccountNumber(r.accountNumber);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() =>
                                  void setBankAccountStatus(
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

export default BankAccountsSettings;
