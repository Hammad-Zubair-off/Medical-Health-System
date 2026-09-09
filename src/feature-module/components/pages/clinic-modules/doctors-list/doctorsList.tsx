import { Link } from "react-router";
import ImageWithBasePath from "../../../../../core/imageWithBasePath";
import {
  all_routes,
  doctorsDetailsPath,
  editDoctorsPath,
} from "../../../../routes/all_routes";
import SearchInput from "../../../../../core/common/dataTable/dataTableSearch";
import Datatable from "../../../../../core/common/dataTable";
import { useDoctors } from "./hooks/useDoctors";
import { useMemo } from "react";
import { listSpecializations } from "../../../../../core/services/firestore/specialization.service";
import { useEffect, useState } from "react";

const DoctorsList = () => {
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

  const dataSource = useMemo(
    () =>
      doctors.map((doctor) => ({
        key: doctor._id,
        _id: doctor._id ?? "",
        Name_Designation: doctor.displayName ?? "Doctor",
        Department:
          (doctor.specializationId && specNames[doctor.specializationId]) ||
          doctor.specialization ||
          "—",
        Phone: doctor.phoneNumber ?? "—",
        Email: doctor.email ?? "—",
        Fees: doctor.consultationFee != null ? `$${doctor.consultationFee}` : "—",
        Status: doctor.status === "inactive" ? "Unavailable" : "Available",
        photoUrl: doctor.photoUrl as string | undefined,
      })),
    [doctors, specNames]
  );

  const columns = [
    {
      title: "Name & Designation",
      dataIndex: "Name_Designation",
      render: (text: string, render: (typeof dataSource)[number]) => (
        <div className="d-flex align-items-center">
          <Link to={doctorsDetailsPath(render._id)} className="avatar me-2">
            {render.photoUrl ? (
              <img src={render.photoUrl} alt="" className="rounded-circle" />
            ) : (
              <ImageWithBasePath
                src="assets/img/doctors/doctor-01.jpg"
                alt="Doctor"
                className="rounded-circle"
              />
            )}
          </Link>
          <div>
            <h6 className="mb-1 fs-14 fw-semibold">
              <Link to={doctorsDetailsPath(render._id)}>{text}</Link>
            </h6>
            <span className="fs-13 d-block">{render.Department}</span>
          </div>
        </div>
      ),
    },
    { title: "Department", dataIndex: "Department" },
    { title: "Phone", dataIndex: "Phone" },
    { title: "Email", dataIndex: "Email" },
    {
      title: "Fees",
      dataIndex: "Fees",
      render: (text: string) => <h6 className="fs-14 fw-semibold mb-0">{text}</h6>,
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: string) => (
        <span
          className={`badge ${
            text === "Available" ? "badge-soft-success" : "badge-soft-danger"
          } border border-success`}
        >
          {text}
        </span>
      ),
    },
    {
      title: "",
      render: (_: unknown, render: (typeof dataSource)[number]) => (
        <div className="d-flex align-items-center">
          <div className="action-item me-2">
            <Link to={all_routes.appointmentCalendar}>
              <i className="ti ti-calendar-cog" />
            </Link>
          </div>
          <div className="action-item">
            <Link to="#" data-bs-toggle="dropdown">
              <i className="ti ti-dots-vertical" />
            </Link>
            <ul className="dropdown-menu">
              <li>
                <Link to={editDoctorsPath(render._id)} className="dropdown-item">
                  Edit
                </Link>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
          <div className="flex-grow-1">
            <h4 className="fw-bold mb-0">
              Doctors List
              <span className="badge badge-soft-primary fs-13 fw-medium ms-2">
                Total Doctors : {doctors.length}
                {hasMore ? "+" : ""}
              </span>
            </h4>
          </div>
          <div className="text-end d-flex">
            <div className="bg-white border shadow-sm rounded px-1 pb-0 text-center d-flex align-items-center justify-content-center me-2">
              <Link to={all_routes.doctorsList} className="bg-light rounded p-1">
                <i className="ti ti-list fs-14 text-dark" />
              </Link>
              <Link to={all_routes.doctors} className="bg-white rounded p-1">
                <i className="ti ti-layout-grid fs-14 text-body" />
              </Link>
            </div>
            <Link to={all_routes.addDoctors} className="btn btn-primary fs-13 btn-md">
              <i className="ti ti-plus me-1" />
              New Doctor
            </Link>
          </div>
        </div>
        <div className="d-flex align-items-center justify-content-between flex-wrap">
          <div className="search-set mb-3">
            <SearchInput value={search} onChange={setSearch} />
          </div>
          <select
            className="form-select form-select-sm w-auto mb-3"
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
          <>
            <Datatable columns={columns} dataSource={dataSource} Selection={false} searchText="" />
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

export default DoctorsList;
