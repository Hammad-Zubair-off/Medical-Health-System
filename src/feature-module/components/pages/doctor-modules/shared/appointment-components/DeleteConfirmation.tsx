import { Link } from "react-router";
import ImageWithBasePath from "../../../../../../core/imageWithBasePath";

interface DeleteConfirmationProps {
  appointmentId?: string;
  appointmentTitle?: string;
  onConfirm?: (id: string) => void;
  onCancel?: () => void;
}

const DeleteConfirmation = ({
  appointmentId,
  appointmentTitle,
  onConfirm,
  onCancel,
}: DeleteConfirmationProps) => {
  const handleConfirm = () => {
    if (appointmentId && onConfirm) {
      onConfirm(appointmentId);
    }
    // Close modal
    const modal = document.getElementById("delete_modal");
    if (modal) {
      const win = window as unknown as {
        bootstrap?: {
          Modal: {
            getInstance: (element: HTMLElement) => { hide: () => void } | null;
          };
        };
      };
      if (win.bootstrap) {
        const instance = win.bootstrap.Modal.getInstance(modal);
        instance?.hide();
      }
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    // Close modal
    const modal = document.getElementById("delete_modal");
    if (modal) {
      const win = window as unknown as {
        bootstrap?: {
          Modal: {
            getInstance: (element: HTMLElement) => { hide: () => void } | null;
          };
        };
      };
      if (win.bootstrap) {
        const instance = win.bootstrap.Modal.getInstance(modal);
        instance?.hide();
      }
    }
  };

  return (
    <div className="modal fade" id="delete_modal">
      <div className="modal-dialog modal-dialog-centered modal-sm">
        <div className="modal-content">
          <div className="modal-body text-center position-relative">
            <ImageWithBasePath
              src="assets/img/bg/delete-modal-bg-01.png"
              alt=""
              className="img-fluid position-absolute top-0 start-0 z-0"
            />
            <ImageWithBasePath
              src="assets/img/bg/delete-modal-bg-02.png"
              alt=""
              className="img-fluid position-absolute bottom-0 end-0 z-0"
            />
            <div className="mb-3 position-relative z-1">
              <span className="avatar avatar-lg bg-danger text-white">
                <i className="ti ti-trash fs-24" />
              </span>
            </div>
            <h5 className="fw-bold mb-1 position-relative z-1">
              Delete Confirmation
            </h5>
            <p className="mb-3 position-relative z-1">
              {appointmentTitle
                ? `Are you sure you want to delete "${appointmentTitle}"?`
                : "Are you sure want to delete?"}
            </p>
            <div className="d-flex justify-content-center">
              <Link
                to="#"
                className="btn btn-light position-relative z-1 me-3"
                data-bs-dismiss="modal"
                onClick={handleCancel}
              >
                Cancel
              </Link>
              <Link
                to="#"
                className="btn btn-danger position-relative z-1"
                data-bs-dismiss="modal"
                onClick={handleConfirm}
              >
                Yes, Delete
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;

