import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Link } from "react-router";
import { DatePicker } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import ImageWithBasePath from "../../../../../core/imageWithBasePath";
import { all_routes } from "../../../../routes/all_routes";
import { useAuth } from "../../../../../core/context/AuthContext";
import { createHoliday } from "../../../../../core/services/firestore/holiday.service";

type HolidaysModalProps = {
  onCreated?: () => void | Promise<void>;
};

const HolidaysModal = ({ onCreated }: HolidaysModalProps) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [date, setDate] = useState<Dayjs | null>(dayjs().add(2, "day"));
  const [isRecurring, setIsRecurring] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getModalContainer = () => {
    const modalElement = document.getElementById("modal-datepicker");
    return modalElement ? modalElement : document.body;
  };

  const blockEnterSubmit = (e: KeyboardEvent) => {
    if (e.key === "Enter") e.preventDefault();
  };

  const hideModal = () => {
    const modalEl = document.getElementById("add_holiday");
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
    if (!name.trim()) {
      setError("Title is required");
      return;
    }
    if (!date) {
      setError("Date is required");
      return;
    }

    setSubmitting(true);
    try {
      await createHoliday(
        {
          name: name.trim(),
          date: date.format("YYYY-MM-DD"),
          isRecurring,
          status: "active",
        },
        user?.uid ?? null
      );
      setName("");
      setDate(dayjs().add(2, "day"));
      setIsRecurring(false);
      await onCreated?.();
      hideModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create holiday");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div id="add_holiday" className="modal fade">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="text-dark modal-title fw-bold">Add Holiday</h5>
              <button
                type="button"
                className="btn-close btn-close-modal custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="fa-solid fa-x" />
              </button>
            </div>
            <form onSubmit={handleSubmit} data-testid="add-holiday-form">
              <div className="modal-body">
                {error ? (
                  <div className="alert alert-danger" role="alert" data-testid="holiday-create-error">
                    {error}
                  </div>
                ) : null}
                <div className="mb-3">
                  <label className="form-label" htmlFor="holiday-name">
                    Title<span className="text-danger ms-1">*</span>
                  </label>
                  <input
                    id="holiday-name"
                    type="text"
                    className="form-control"
                    data-testid="holiday-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3 form-check">
                  <input
                    id="holiday-recurring"
                    type="checkbox"
                    className="form-check-input"
                    data-testid="holiday-recurring"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="holiday-recurring">
                    Recurring yearly
                  </label>
                </div>
                <div className="mb-0">
                  <label className="form-label">
                    Date<span className="text-danger ms-1">*</span>
                  </label>
                  <div className="input-icon-end position-relative">
                    <DatePicker
                      className="form-control datetimepicker"
                      data-testid="holiday-date"
                      format={{ format: "DD-MM-YYYY", type: "mask" }}
                      getPopupContainer={getModalContainer}
                      placeholder="DD-MM-YYYY"
                      suffixIcon={null}
                      value={date}
                      onChange={(v) => setDate(v)}
                      onKeyDown={blockEnterSubmit}
                    />
                    <span className="input-icon-addon">
                      <i className="ti ti-calendar" />
                    </span>
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
                  data-testid="holiday-create-submit"
                  disabled={submitting}
                >
                  {submitting ? "Saving…" : "Add Holiday"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div id="edit_holiday" className="modal fade">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="text-dark modal-title fw-bold">Edit Holiday</h5>
              <button
                type="button"
                className="btn-close btn-close-modal custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="fa-solid fa-x" />
              </button>
            </div>
            <div className="modal-body">
              <p className="text-muted mb-0">
                Edit holiday is not available here. Deactivate or add a new holiday instead.
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-white border" data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="delete_holiday">
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
                  to={all_routes.holidays}
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

export default HolidaysModal;
