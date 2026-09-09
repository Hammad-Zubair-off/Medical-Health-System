import { Link } from "react-router";
import ImageWithBasePath from "../../../../../core/imageWithBasePath";
import { all_routes, editPatientPath, patientDetailsPath } from "../../../../routes/all_routes";
import { usePatients } from "../patients/hooks/usePatients";
import { formatGenderAge } from "../../../../../core/utils/display.utils";
import SearchInput from "../../../../../core/common/dataTable/dataTableSearch";

const PatientsGrid = () => {
  const {
    patients,
    loading,
    error,
    hasMore,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    loadMore,
    deactivatePatient,
  } = usePatients();

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-4">
          <div className="flex-grow-1">
            <h4 className="fw-bold mb-0">
              Patient Grid
              <span className="badge badge-soft-primary fw-medium border py-1 px-2 border-primary fs-13 ms-1">
                Total Patients : {patients.length}
                {hasMore ? "+" : ""}
              </span>
            </h4>
          </div>
          <div className="text-end d-flex">
            <div className="bg-white border shadow-sm rounded px-1 pb-0 text-center d-flex align-items-center justify-content-center">
              <Link
                to={all_routes.patients}
                className="bg-white rounded p-1 d-flex align-items-center justify-content-center"
              >
                <i className="ti ti-list fs-14 text-dark" />
              </Link>
              <Link
                to={all_routes.patientsGrid}
                className="bg-light rounded p-1 d-flex align-items-center justify-content-center"
              >
                <i className="ti ti-layout-grid fs-14 text-body" />
              </Link>
            </div>
            <Link to={all_routes.createPatient} className="btn btn-primary ms-2 fs-13 btn-md">
              <i className="ti ti-plus me-1" />
              New Patient
            </Link>
          </div>
        </div>
        <div className="d-flex align-items-center justify-content-between flex-wrap mb-3">
          <SearchInput value={search} onChange={setSearch} />
          <select
            className="form-select form-select-sm w-auto"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        {loading && patients.length === 0 ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-3">Loading patients...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="alert alert-info">No patients found.</div>
        ) : (
          <div className="row">
            {patients.map((patient) => (
              <div className="col-xl-4 col-md-6" key={patient._id}>
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center">
                        <Link to={patientDetailsPath(patient._id)} className="avatar avatar-lg me-2">
                          {patient.photoUrl ? (
                            <img src={patient.photoUrl} alt="" className="rounded-circle" />
                          ) : (
                            <ImageWithBasePath
                              src="assets/img/users/user-08.jpg"
                              alt="product"
                              className="rounded-circle"
                            />
                          )}
                        </Link>
                        <Link to={patientDetailsPath(patient._id)} className="text-dark fw-semibold">
                          {patient.displayName}
                          <span className="text-body fs-13 fw-normal d-block">
                            {formatGenderAge(patient.gender, patient.dateOfBirth)}
                          </span>
                        </Link>
                      </div>
                      <Link to="#" className="shadow-sm fs-14 d-inline-flex border rounded-2 p-1" data-bs-toggle="dropdown">
                        <i className="ti ti-dots-vertical" />
                      </Link>
                      <ul className="dropdown-menu p-2">
                        <li>
                          <Link to={editPatientPath(patient._id)} className="dropdown-item">
                            Edit
                          </Link>
                        </li>
                        <li>
                          <button
                            type="button"
                            className="dropdown-item"
                            onClick={() => void deactivatePatient(patient._id)}
                          >
                            Deactivate
                          </button>
                        </li>
                      </ul>
                    </div>
                    <p className="mb-1 fs-13">{patient.phoneNumber ?? "—"}</p>
                    <p className="mb-0 fs-13">{patient.email ?? "—"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {hasMore && (
          <div className="text-center mt-3">
            <button type="button" className="btn btn-outline-primary" onClick={() => void loadMore()} disabled={loading}>
              {loading ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientsGrid;
