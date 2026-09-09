import { Link } from "react-router";
import { all_routes, editPatientPath, patientDetailsPath, doctorsDetailsPath } from "../../../../routes/all_routes";
import Datatable from "../../../../../core/common/dataTable";
import ImageWithBasePath from "../../../../../core/imageWithBasePath";
import SearchInput from "../../../../../core/common/dataTable/dataTableSearch";
import { usePatients } from "./hooks/usePatients";
import { formatAddress, formatDate, formatGenderAge } from "../../../../../core/utils/display.utils";
import { useEffect, useMemo, useState } from "react";
import { getDocsByIds } from "../../../../../core/services/firestore/_helpers";
import { db } from "../../../../../firebase";

const Patients = () => {
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
  const [doctorNames, setDoctorNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const ids = Array.from(
      new Set(patients.map((p) => p.primaryDoctorId).filter((id): id is string => Boolean(id)))
    );
    if (ids.length === 0) {
      setDoctorNames({});
      return;
    }
    void getDocsByIds(db, "Doctor", ids).then((docs) => {
      const map: Record<string, string> = {};
      docs.forEach((d) => {
        const data = d.data();
        map[d.id] = (data.displayName as string) || "Doctor";
      });
      setDoctorNames(map);
    });
  }, [patients]);

  const dataSource = useMemo(
    () =>
      patients.map((patient) => ({
        key: patient._id,
        _id: patient._id,
        Patient: patient.displayName,
        Gender: formatGenderAge(patient.gender, patient.dateOfBirth),
        Phone: patient.phoneNumber ?? "—",
        Doctor: patient.primaryDoctorId
          ? doctorNames[patient.primaryDoctorId] ?? "—"
          : "—",
        doctorId: patient.primaryDoctorId,
        Address: formatAddress(patient.address),
        Last_Visit: formatDate(patient.lastVisit),
        Status: patient.status === "active" ? "Available" : "Unavailable",
        photoUrl: patient.photoUrl,
      })),
    [patients, doctorNames]
  );

  const columns = [
    {
      title: "Patient",
      dataIndex: "Patient",
      render: (text: string, render: (typeof dataSource)[number]) => (
        <div className="d-flex align-items-center">
          <Link to={patientDetailsPath(render._id)} className="avatar avatar-md me-2">
            {render.photoUrl ? (
              <img src={render.photoUrl} alt="" className="rounded-circle" />
            ) : (
              <ImageWithBasePath
                src="assets/img/users/user-08.jpg"
                alt="product"
                className="rounded-circle"
              />
            )}
          </Link>
          <Link to={patientDetailsPath(render._id)} className="text-dark fw-semibold">
            {text}
            <span className="text-body fs-13 fw-normal d-block">{render.Gender}</span>
          </Link>
        </div>
      ),
    },
    { title: "Phone", dataIndex: "Phone" },
    {
      title: "Doctor",
      dataIndex: "Doctor",
      render: (text: string, render: (typeof dataSource)[number]) => (
        <div className="d-flex align-items-center">
          {render.doctorId ? (
            <Link to={doctorsDetailsPath(render.doctorId)} className="fw-semibold">
              {text}
            </Link>
          ) : (
            <span>{text}</span>
          )}
        </div>
      ),
    },
    { title: "Address", dataIndex: "Address" },
    { title: "Last Visit", dataIndex: "Last_Visit" },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: string) => (
        <span
          className={`badge rounded fs-13 fw-medium ${
            text === "Available"
              ? "badge-soft-success text-success border-success border"
              : "badge-soft-danger text-danger border-danger border"
          }`}
        >
          {text}
        </span>
      ),
    },
    {
      title: "",
      render: (_: unknown, render: (typeof dataSource)[number]) => (
        <div className="d-flex align-items-center gap-1">
          <Link
            to={all_routes.appointments}
            className="shadow-sm fs-14 d-inline-flex border rounded-2 p-1 me-1"
          >
            <i className="ti ti-calendar-cog" />
          </Link>
          <Link
            to="#"
            className="shadow-sm fs-14 d-inline-flex border rounded-2 p-1 me-1"
            data-bs-toggle="dropdown"
          >
            <i className="ti ti-dots-vertical" />
          </Link>
          <ul className="dropdown-menu p-2">
            <li>
              <Link to={editPatientPath(render._id)} className="dropdown-item">
                Edit
              </Link>
            </li>
            <li>
              <Link to={patientDetailsPath(render._id)} className="dropdown-item">
                View
              </Link>
            </li>
            <li>
              <button
                type="button"
                className="dropdown-item"
                onClick={() => void deactivatePatient(render._id)}
              >
                Deactivate
              </button>
            </li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 pb-3 mb-3 border-1 border-bottom">
          <div className="flex-grow-1">
            <h4 className="fw-bold mb-0">
              Patients List
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
                className="bg-light rounded p-1 d-flex align-items-center justify-content-center"
              >
                <i className="ti ti-list fs-14 text-dark" />
              </Link>
              <Link
                to={all_routes.patientsGrid}
                className="bg-white rounded p-1 d-flex align-items-center justify-content-center"
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
        <div className="d-flex align-items-center justify-content-between flex-wrap">
          <div className="search-set mb-3">
            <SearchInput value={search} onChange={setSearch} />
          </div>
          <div className="d-flex table-dropdown mb-3 align-items-center gap-2">
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as typeof statusFilter)
              }
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
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
          <>
            <div className="table-responsive">
              <Datatable columns={columns} dataSource={dataSource} Selection={false} searchText="" />
            </div>
            {hasMore && (
              <div className="text-center mt-3">
                <button type="button" className="btn btn-outline-primary" onClick={() => void loadMore()} disabled={loading}>
                  {loading ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Patients;
