import { useEffect, useMemo, useState, type FormEvent, type KeyboardEvent } from "react";
import { Link } from "react-router";
import { DatePicker } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { all_routes } from "../../../../../routes/all_routes";
import ImageWithBasePath from "../../../../../../core/imageWithBasePath";
import { useAuth } from "../../../../../../core/context/AuthContext";
import {
  createLeave,
  listLeaveTypes,
} from "../../../../../../core/services/firestore/leave.service";
import { listStaff } from "../../../../../../core/services/firestore/staff.service";
import { countLeaveDays } from "../../../../../../core/utils/leave.utils";

type Option = { id: string; label: string };

type LeavesModalProps = {
  onCreated?: () => void | Promise<void>;
};

const LeavesModal = ({ onCreated }: LeavesModalProps) => {
  const { user } = useAuth();
  const [staffOptions, setStaffOptions] = useState<Option[]>([]);
  const [typeOptions, setTypeOptions] = useState<Option[]>([]);
  const [optionsLoaded, setOptionsLoaded] = useState(false);
  const [staffId, setStaffId] = useState("");
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [from, setFrom] = useState<Dayjs | null>(dayjs());
  const [to, setTo] = useState<Dayjs | null>(dayjs());
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getModalContainer = () => {
    const modalElement = document.getElementById("modal-datepicker");
    return modalElement ? modalElement : document.body;
  };

  const blockEnterSubmit = (e: KeyboardEvent) => {
    if (e.key === "Enter") e.preventDefault();
  };

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [staffResult, typesResult] = await Promise.all([
          listStaff({ pageSize: 50, status: "active" }),
          listLeaveTypes({ pageSize: 50, status: "active" }),
        ]);
        if (cancelled) return;
        setStaffOptions(
          staffResult.staff.map((s) => ({
            id: s._id,
            label: s.displayName || s.staffId || s._id,
          }))
        );
        setTypeOptions(
          typesResult.leaveTypes.map((t) => ({
            id: t._id,
            label: t.name,
          }))
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load leave options"
          );
        }
      } finally {
        if (!cancelled) setOptionsLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const days = useMemo(() => {
    if (!from || !to) return 0;
    return countLeaveDays(from.toDate(), to.toDate());
  }, [from, to]);

  const resetForm = () => {
    setStaffId("");
    setLeaveTypeId("");
    setFrom(dayjs());
    setTo(dayjs());
    setReason("");
    setError(null);
  };

  const hideModal = () => {
    const modalEl = document.getElementById("add_leave");
    const bootstrap = (
      window as unknown as {
        bootstrap?: {
          Modal?: { getInstance: (el: Element) => { hide: () => void } | null };
        };
      }
    ).bootstrap;
    if (modalEl && bootstrap?.Modal) {
      bootstrap.Modal.getInstance(modalEl)?.hide();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!staffId) {
      setError("Select an employee");
      return;
    }
    if (!leaveTypeId) {
      setError("Select a leave type");
      return;
    }
    if (!from || !to) {
      setError("From and To dates are required");
      return;
    }
    if (to.isBefore(from, "day")) {
      setError("To date must be on or after From date");
      return;
    }

    setSubmitting(true);
    try {
      await createLeave(
        {
          staffId,
          leaveTypeId,
          from: from.format("YYYY-MM-DD"),
          to: to.format("YYYY-MM-DD"),
          reason: reason.trim() || `Leave ${from.format("YYYY-MM-DD")}`,
        },
        user?.uid ?? null,
        { asAdmin: true, status: "pending" }
      );
      resetForm();
      await onCreated?.();
      hideModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create leave");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div id="add_leave" className="modal fade">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="text-dark modal-title fw-bold">Add New Leave</h4>
              <button
                type="button"
                className="btn-close btn-close-modal custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <form onSubmit={handleSubmit} data-testid="add-leave-form">
              <div className="modal-body">
                {error ? (
                  <div className="alert alert-danger" role="alert" data-testid="leave-create-error">
                    {error}
                  </div>
                ) : null}
                <div className="row row-gap-2">
                  <div className="col-md-6">
                    <div className="mb-0">
                      <label className="form-label" htmlFor="leave-staff">
                        Employee<span className="text-danger ms-1">*</span>
                      </label>
                      <select
                        id="leave-staff"
                        className="form-select"
                        data-testid="leave-staff"
                        value={staffId}
                        onChange={(e) => setStaffId(e.target.value)}
                        required
                      >
                        <option value="">
                          {optionsLoaded
                            ? staffOptions.length
                              ? "Select employee"
                              : "No staff found"
                            : "Loading…"}
                        </option>
                        {staffOptions.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-0">
                      <label className="form-label" htmlFor="leave-type">
                        Leave Type<span className="text-danger ms-1">*</span>
                      </label>
                      <select
                        id="leave-type"
                        className="form-select"
                        data-testid="leave-type"
                        value={leaveTypeId}
                        onChange={(e) => setLeaveTypeId(e.target.value)}
                        required
                      >
                        <option value="">
                          {optionsLoaded
                            ? typeOptions.length
                              ? "Select leave type"
                              : "No leave types"
                            : "Loading…"}
                        </option>
                        {typeOptions.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-0">
                      <label className="form-label">
                        From Date<span className="text-danger ms-1">*</span>
                      </label>
                      <div className="input-icon-end position-relative">
                        <DatePicker
                          className="form-control datetimepicker"
                          data-testid="leave-from"
                          format={{ format: "DD-MM-YYYY", type: "mask" }}
                          getPopupContainer={getModalContainer}
                          placeholder="DD-MM-YYYY"
                          suffixIcon={null}
                          value={from}
                          onChange={(v) => setFrom(v)}
                          onKeyDown={blockEnterSubmit}
                        />
                        <span className="input-icon-addon">
                          <i className="ti ti-calendar" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-0">
                      <label className="form-label">
                        To Date<span className="text-danger ms-1">*</span>
                      </label>
                      <div className="input-icon-end position-relative">
                        <DatePicker
                          className="form-control datetimepicker"
                          data-testid="leave-to"
                          format={{ format: "DD-MM-YYYY", type: "mask" }}
                          getPopupContainer={getModalContainer}
                          placeholder="DD-MM-YYYY"
                          suffixIcon={null}
                          value={to}
                          onChange={(v) => setTo(v)}
                          onKeyDown={blockEnterSubmit}
                        />
                        <span className="input-icon-addon">
                          <i className="ti ti-calendar" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-0">
                      <label className="form-label" htmlFor="leave-days">
                        No of Days
                      </label>
                      <input
                        id="leave-days"
                        type="text"
                        className="form-control"
                        data-testid="leave-days"
                        value={days > 0 ? String(days) : ""}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-0">
                      <label className="form-label" htmlFor="leave-reason">
                        Reason
                      </label>
                      <textarea
                        id="leave-reason"
                        className="form-control"
                        rows={3}
                        data-testid="leave-reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Optional reason"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer d-flex align-items-center gap-1">
                <button
                  type="button"
                  className="btn btn-white border"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  data-testid="leave-create-submit"
                  disabled={
                    submitting ||
                    !optionsLoaded ||
                    staffOptions.length === 0 ||
                    typeOptions.length === 0
                  }
                >
                  {submitting ? "Saving…" : "Add New Leave"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div id="edit_leave" className="modal fade">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="text-dark modal-title fw-bold">Edit Leave</h4>
              <button
                type="button"
                className="btn-close btn-close-modal custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <div className="modal-body">
              <p className="text-muted mb-0">
                Edit leave is not available. Reject or approve from the list, then create a new
                request if needed.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-white border"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="delete_leave">
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content">
            <div className="modal-body text-center position-relative z-1">
              <ImageWithBasePath
                src="assets/img/bg/delete-modal-bg-01.png"
                alt=""
                className="img-fluid position-absolute top-0 start-0 z-n1"
              />
              <ImageWithBasePath
                src="assets/img/bg/delete-modal-bg-02.png"
                alt=""
                className="img-fluid position-absolute bottom-0 end-0 z-n1"
              />
              <div className="mb-3">
                <span className="avatar avatar-lg bg-danger text-white">
                  <i className="ti ti-trash fs-24" />
                </span>
              </div>
              <h5 className="fw-bold mb-1">Delete Confirmation</h5>
              <p className="mb-3">Are you sure want to delete?</p>
              <div className="d-flex justify-content-center">
                <Link
                  to="#"
                  className="btn btn-light position-relative z-1 me-3"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </Link>
                <Link
                  to={all_routes.leaves}
                  className="btn btn-danger position-relative z-1"
                >
                  Yes, Delete
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LeavesModal;
