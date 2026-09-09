import { Link } from "react-router";
import { useMemo, useState } from "react";
import {
  all_routes,
  patientPrescriptionDetailsPath,
} from "../../../../routes/all_routes";
import Datatable from "../../../../../core/common/dataTable";
import SearchInput from "../../../../../core/common/dataTable/dataTableSearch";
import { useAuth } from "../../../../../core/context/AuthContext";
import { formatDate } from "../../../../../core/utils/display.utils";
import { usePrescriptions } from "../../doctor-modules/doctors-prescriptions/hooks/usePrescriptions";

const PatientPrescriptions = () => {
  const { user } = useAuth();
  const {
    prescriptions,
    loading,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    hasMore,
    loadMore,
  } = usePrescriptions({ patientUserId: user?.uid });

  const [searchText, setSearchText] = useState("");

  const dataSource = useMemo(
    () =>
      prescriptions.map((p) => ({
        key: p._id,
        _id: p._id,
        Prescription_ID: p.prescriptionId || p._id,
        Doctor_Name: p.doctorName || "—",
        Prescribed_On: formatDate(p.prescribedOn as never),
        Status: p.status,
        Diagnosis: p.diagnosis || "—",
      })),
    [prescriptions]
  );

  const columns = [
    {
      title: "Prescription ID",
      dataIndex: "Prescription_ID",
      render: (text: string, render: (typeof dataSource)[number]) => (
        <Link to={patientPrescriptionDetailsPath(render._id)}>{text}</Link>
      ),
      sorter: (a: (typeof dataSource)[number], b: (typeof dataSource)[number]) =>
        a.Prescription_ID.localeCompare(b.Prescription_ID),
    },
    {
      title: "Doctor Name",
      dataIndex: "Doctor_Name",
      render: (text: string, render: (typeof dataSource)[number]) => (
        <Link
          to={patientPrescriptionDetailsPath(render._id)}
          className="text-dark fw-semibold"
        >
          {text}
        </Link>
      ),
      sorter: (a: (typeof dataSource)[number], b: (typeof dataSource)[number]) =>
        a.Doctor_Name.localeCompare(b.Doctor_Name),
    },
    {
      title: "Prescribed On",
      dataIndex: "Prescribed_On",
      sorter: (a: (typeof dataSource)[number], b: (typeof dataSource)[number]) =>
        a.Prescribed_On.localeCompare(b.Prescribed_On),
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: string) => (
        <span
          className={`badge rounded fw-medium fs-13 ${
            text === "cancelled"
              ? "badge-soft-danger text-danger"
              : text === "completed"
                ? "badge-soft-success text-success"
                : "badge-soft-info text-info"
          }`}
        >
          {text}
        </span>
      ),
      sorter: (a: (typeof dataSource)[number], b: (typeof dataSource)[number]) =>
        a.Status.localeCompare(b.Status),
    },
    {
      title: "",
      render: (_: unknown, render: (typeof dataSource)[number]) => (
        <div className="action-item">
          <Link to="#" data-bs-toggle="dropdown">
            <i className="ti ti-dots-vertical" />
          </Link>
          <ul className="dropdown-menu p-2">
            <li>
              <Link
                to={patientPrescriptionDetailsPath(render._id)}
                className="dropdown-item d-flex align-items-center"
              >
                View
              </Link>
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
            <h4 className="fw-bold mb-0">Prescriptions</h4>
          </div>
        </div>

        <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
          <div className="search-set mb-3">
            <div className="table-search d-flex align-items-center mb-0">
              <div className="search-input">
                <SearchInput
                  value={searchText}
                  onChange={(value) => {
                    setSearchText(value);
                    setSearch(value);
                  }}
                />
              </div>
            </div>
          </div>
          <div className="mb-3">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as typeof statusFilter)
              }
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading && prescriptions.length === 0 ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-3">Loading prescriptions...</p>
          </div>
        ) : !loading && dataSource.length === 0 ? (
          <div className="text-center py-5 text-muted">
            {search || statusFilter !== "all"
              ? "No prescriptions match your filters."
              : "No prescriptions yet."}
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <Datatable
                columns={columns}
                dataSource={dataSource}
                Selection={false}
                searchText={searchText}
              />
            </div>
            {hasMore && (
              <div className="text-center mt-3">
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  disabled={loading}
                  onClick={() => {
                    void loadMore();
                  }}
                >
                  {loading ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <div className="footer text-center bg-white p-2 border-top">
        <p className="text-dark mb-0">
          2025 ©
          <Link to={all_routes.patientdashboard} className="link-primary">
            Doctoury
          </Link>
          , All Rights Reserved
        </p>
      </div>
    </div>
  );
};

export default PatientPrescriptions;
