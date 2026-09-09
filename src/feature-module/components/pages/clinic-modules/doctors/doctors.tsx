import { Link } from "react-router";
import ImageWithBasePath from "../../../../../core/imageWithBasePath";
import {
  all_routes,
  doctorsDetailsPath,
  editDoctorsPath,
} from "../../../../routes/all_routes";
import { useDoctors } from "../doctors-list/hooks/useDoctors";
import SearchInput from "../../../../../core/common/dataTable/dataTableSearch";
import { useEffect, useState } from "react";
import { listSpecializations } from "../../../../../core/services/firestore/specialization.service";

const Doctors = () => {
  const {
    doctors,
    loading,
    error,
    hasMore,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    loadMore,
  } = useDoctors();
  const [specNames, setSpecNames] = useState<Record<string, string>>({});

  useEffect(() => {
    void listSpecializations(false).then((rows) => {
      const map: Record<string, string> = {};
      rows.forEach((s) => {
        map[s._id] = s.name;
      });
      setSpecNames(map);
    });
  }, []);

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3">
          <div className="flex-grow-1">
            <h4 className="fw-bold mb-0">
              Doctor Grid
              <span className="badge badge-soft-primary fs-13 fw-medium ms-2">
                Total Doctors : {doctors.length}
                {hasMore ? "+" : ""}
              </span>
            </h4>
          </div>
          <div className="text-end d-flex">
            <div className="bg-white border shadow-sm rounded px-1 me-2 d-flex align-items-center">
              <Link to={all_routes.doctorsList} className="bg-white rounded p-1">
                <i className="ti ti-list fs-14 text-dark" />
              </Link>
              <Link to={all_routes.doctors} className="bg-light rounded p-1">
                <i className="ti ti-layout-grid fs-14 text-body" />
              </Link>
            </div>
            <Link to={all_routes.addDoctors} className="btn btn-primary fs-13 btn-md">
              <i className="ti ti-plus me-1" />
              New Doctor
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
        {loading && doctors.length === 0 ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-3">Loading doctors...</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="alert alert-info">No doctors found.</div>
        ) : (
          <div className="row">
            {doctors.map((doctor) => {
              const id = doctor._id ?? "";
              const spec =
                (doctor.specializationId && specNames[doctor.specializationId]) ||
                doctor.specialization ||
                "—";
              return (
                <div className="col-xl-4 col-md-6" key={id}>
                  <div className="card">
                    <div className="card-body d-flex align-items-center flex-sm-nowrap flex-wrap row-gap-3">
                      <div className="me-3 doctor-profile-img">
                        <Link to={doctorsDetailsPath(id)}>
                          {doctor.photoUrl ? (
                            <img src={String(doctor.photoUrl)} className="rounded" alt="" />
                          ) : (
                            <ImageWithBasePath
                              src="assets/img/doctors/doctor-01.jpg"
                              className="rounded"
                              alt=""
                            />
                          )}
                        </Link>
                      </div>
                      <div className="flex-fill">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <h6 className="mb-0 fw-semibold">
                            <Link to={doctorsDetailsPath(id)}>
                              {doctor.displayName ?? "Doctor"}
                            </Link>
                          </h6>
                          <div className="action-item">
                            <Link to="#" data-bs-toggle="dropdown">
                              <i className="ti ti-dots-vertical" />
                            </Link>
                            <ul className="dropdown-menu">
                              <li>
                                <Link to={editDoctorsPath(id)} className="dropdown-item">
                                  Edit
                                </Link>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <span className="d-block mb-2 fs-13">{spec}</span>
                        <div className="d-flex align-items-center justify-content-between">
                          <h6 className="text-primary fs-14 mb-0">
                            <span className="text-muted fs-13 fw-normal">Starts From : </span>
                            {doctor.consultationFee != null ? `$${doctor.consultationFee}` : "—"}
                          </h6>
                          <Link
                            to={all_routes.appointmentCalendar}
                            className="avatar avatar-xs border text-muted fs-14"
                          >
                            <i className="ti ti-calendar-cog" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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

export default Doctors;
