import { Link, Navigate, useParams } from "react-router";
import { all_routes } from "../../../../routes/all_routes";
import ImageWithBasePath from "../../../../../core/imageWithBasePath";
import { useAuth } from "../../../../../core/context/AuthContext";
import { formatDate } from "../../../../../core/utils/display.utils";
import { usePrescription } from "../../doctor-modules/doctors-prescriptions/hooks/usePrescription";

const PatientPrescriptionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { prescription, loading, error, notFound } = usePrescription(id);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3">Loading prescription...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return <Navigate to={all_routes.error404} replace />;
  }

  if (error || !prescription) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="alert alert-danger">{error || "Prescription not found"}</div>
        </div>
      </div>
    );
  }

  if (prescription.patientUserId !== user?.uid) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="alert alert-danger" role="alert">
            Access denied. You can only view your own prescriptions.
          </div>
          <Link to={all_routes.patientPrescriptions} className="btn btn-primary">
            Back to prescriptions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="row">
          <div className="col-lg-10 mx-auto">
            <div className="d-flex align-items-sm-center flex-sm-row flex-column mb-4">
              <div className="flex-grow-1">
                <h6 className="fs-14 fw-semibold mb-0 d-flex align-items-center">
                  <Link to={all_routes.patientPrescriptions} className="me-1">
                    <i className="ti ti-chevron-left" /> Prescriptions
                  </Link>
                </h6>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between border-1 border-bottom pb-3 mb-3">
                  <div className="invoice-logo">
                    <ImageWithBasePath
                      src="assets/img/logo.svg"
                      className="logo-white"
                      alt="logo"
                    />
                    <ImageWithBasePath
                      src="assets/img/logo-white.svg"
                      className="logo-dark"
                      alt="logo"
                    />
                  </div>
                  <span className="badge bg-info-subtle text-info-emphasis fs-13 fw-medium border border-primary py-1 px-2">
                    #{prescription.prescriptionId || prescription._id}
                  </span>
                </div>

                <div className="d-flex align-items-center justify-content-between border-1 border-bottom pb-3 mb-3 flex-wrap gap-2">
                  <div>
                    <h6 className="text-dark fw-semibold mb-1">
                      {prescription.doctorName || "Doctor"}
                    </h6>
                    <p className="mb-0">
                      Status:{" "}
                      <span className="text-body text-capitalize">
                        {prescription.status}
                      </span>
                    </p>
                  </div>
                  <div className="text-lg-end">
                    <p className="text-dark mb-1">
                      Prescribed on:{" "}
                      <span className="text-body">
                        {formatDate(prescription.prescribedOn as never)}
                      </span>
                    </p>
                    {prescription.followUpDate && (
                      <p className="text-dark mb-0">
                        Follow-up:{" "}
                        <span className="text-body">
                          {formatDate(prescription.followUpDate as never)}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {prescription.diagnosis && (
                  <div className="mb-3">
                    <h6 className="mb-1 fs-14 fw-semibold">Diagnosis</h6>
                    <p className="mb-0">{prescription.diagnosis}</p>
                  </div>
                )}

                <div className="mb-4">
                  <h6 className="mb-3 fs-16 fw-semibold text-center">Medicines</h6>
                  <div className="table-responsive border bg-white">
                    <table className="table table-nowrap mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="text-dark">SNO</th>
                          <th className="text-dark">Medicine Name</th>
                          <th className="text-dark">Dosage</th>
                          <th className="text-dark">Frequency</th>
                          <th className="text-dark">Duration</th>
                          <th className="text-dark">Instructions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prescription.medicines.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center text-muted">
                              No medicines listed
                            </td>
                          </tr>
                        ) : (
                          prescription.medicines.map((med: { name?: string; dosage?: string; frequency?: string; duration?: string; instructions?: string | null }, index: number) => (
                            <tr key={`${med.name}-${index}`}>
                              <td>{String(index + 1).padStart(2, "0")}</td>
                              <td>{med.name}</td>
                              <td>{med.dosage}</td>
                              <td>{med.frequency}</td>
                              <td>{med.duration}</td>
                              <td>{med.instructions || "—"}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {prescription.notes && (
                  <div className="pb-3 mb-0 border-1 border-bottom">
                    <h6 className="mb-1 fs-16 fw-semibold">Notes</h6>
                    <p className="mb-0">{prescription.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-3 bg-white border-1 border-top text-center">
        <p className="text-dark text-center mb-0">
          2025 © <span className="text-info">Doctoury</span>, All Rights Reserved
        </p>
      </div>
    </div>
  );
};

export default PatientPrescriptionDetails;
