import { useCallback } from "react";
import { Link } from "react-router";
import Datatable from "../../../../../../core/common/dataTable";
import { getPatientReport } from "../../../../../../core/services/firestore/report.service";
import { useReport } from "../hooks/useReport";
import DateRangeFilter from "../shared/DateRangeFilter";

const PatientReport = () => {
  const fetcher = useCallback((range: { from: Date; to: Date }) => getPatientReport(range), []);
  const { range, setRange, data, loading, error } = useReport(fetcher);

  const columns = [
    {
      title: "Patient",
      dataIndex: "Patient",
      sorter: (a: { Patient: string }, b: { Patient: string }) =>
        a.Patient.localeCompare(b.Patient),
    },
    {
      title: "Age/Gender",
      dataIndex: "AgeGender",
      sorter: (a: { AgeGender: string }, b: { AgeGender: string }) =>
        a.AgeGender.localeCompare(b.AgeGender),
    },
    {
      title: "Contact Info",
      dataIndex: "ContactInfo",
      render: (text: string, render: { Email: string }) => (
        <>
          <p className="text-dark mb-0">{text}</p>
          <span>{render.Email}</span>
        </>
      ),
      sorter: (a: { ContactInfo: string }, b: { ContactInfo: string }) =>
        a.ContactInfo.localeCompare(b.ContactInfo),
    },
    {
      title: "Location",
      dataIndex: "Location",
      sorter: (a: { Location: string }, b: { Location: string }) =>
        a.Location.localeCompare(b.Location),
    },
    {
      title: "Last Visit",
      dataIndex: "LastVisit",
      sorter: (a: { LastVisit: string }, b: { LastVisit: string }) =>
        a.LastVisit.localeCompare(b.LastVisit),
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: string) => (
        <span
          className={`badge ${
            text === "Available"
              ? "badge-soft-success border border-success"
              : "badge-soft-danger border border-danger"
          } px-2 py-1 fs-13 fw-medium`}
        >
          {text}
        </span>
      ),
      sorter: (a: { Status: string }, b: { Status: string }) =>
        a.Status.localeCompare(b.Status),
    },
  ];

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
          <div className="flex-grow-1">
            <h4 className="fw-bold mb-0">Patient Report</h4>
          </div>
        </div>

        <div className="card mb-3">
          <div className="card-body">
            <DateRangeFilter value={range} onChange={setRange} disabled={loading} />
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {data?.message && <div className="alert alert-warning">{data.message}</div>}
        {loading && <div className="alert alert-info">Loading patients…</div>}

        {!loading && data && (
          <>
            <div className="row mb-3">
              <div className="col-md-4">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <p className="mb-1 text-muted">New in range</p>
                    <h5 className="mb-0 fw-bold">{data.newCount}</h5>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <p className="mb-1 text-muted">Active</p>
                    <h5 className="mb-0 fw-bold">{data.activeCount}</h5>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <div className="table-responsive">
                  <Datatable
                    columns={columns}
                    dataSource={data.rows}
                    Selection={false}
                    searchText=""
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="footer text-center bg-white p-2 border-top">
        <p className="text-dark mb-0">
          2025 ©{" "}
          <Link to="#" className="link-primary">
            Preclinic
          </Link>
        </p>
      </div>
    </div>
  );
};

export default PatientReport;
