import { useCallback } from "react";
import { Link } from "react-router";
import Datatable from "../../../../../../core/common/dataTable";
import { getAppointmentReport } from "../../../../../../core/services/firestore/report.service";
import { useReport } from "../hooks/useReport";
import DateRangeFilter from "../shared/DateRangeFilter";

const AppointmentReport = () => {
  const fetcher = useCallback((range: { from: Date; to: Date }) => getAppointmentReport(range), []);
  const { range, setRange, data, loading, error } = useReport(fetcher);

  const columns = [
    {
      title: "Patient",
      dataIndex: "Patient",
      sorter: (a: { Patient: string }, b: { Patient: string }) =>
        a.Patient.localeCompare(b.Patient),
    },
    {
      title: "Date & Time",
      dataIndex: "DateTime",
      sorter: (a: { DateTime: string }, b: { DateTime: string }) =>
        a.DateTime.localeCompare(b.DateTime),
    },
    {
      title: "Appointment ID",
      dataIndex: "InvoiceID",
      sorter: (a: { InvoiceID: string }, b: { InvoiceID: string }) =>
        a.InvoiceID.localeCompare(b.InvoiceID),
    },
    {
      title: "Practitioner",
      dataIndex: "Practioner",
      render: (text: string) => <p className="text-dark fw-medium mb-0">{text}</p>,
      sorter: (a: { Practioner: string }, b: { Practioner: string }) =>
        a.Practioner.localeCompare(b.Practioner),
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: string) => (
        <span
          className={`badge ${
            text === "Checked Out" || text === "Completed"
              ? "badge-soft-primary border-primary"
              : text === "Confirmed"
                ? "badge-soft-success border-success"
                : text === "Cancelled"
                  ? "badge-soft-danger border-danger"
                  : "border-warning badge-soft-warning"
          } border px-2 py-1 fs-13 fw-medium`}
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
            <h4 className="fw-bold mb-0">Appointment Report</h4>
          </div>
        </div>

        <div className="card mb-3">
          <div className="card-body">
            <DateRangeFilter value={range} onChange={setRange} disabled={loading} />
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {data?.message && <div className="alert alert-warning">{data.message}</div>}
        {loading && <div className="alert alert-info">Loading appointments…</div>}

        {!loading && data && (
          <>
            <div className="row mb-3">
              <div className="col-md-3">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <p className="mb-1 text-muted">Total</p>
                    <h5 className="mb-0 fw-bold">{data.docCount}</h5>
                  </div>
                </div>
              </div>
              {Object.entries(data.byStatus)
                .slice(0, 3)
                .map(([status, count]) => (
                  <div className="col-md-3" key={status}>
                    <div className="card shadow-sm">
                      <div className="card-body">
                        <p className="mb-1 text-muted text-capitalize">{status}</p>
                        <h5 className="mb-0 fw-bold">{count}</h5>
                      </div>
                    </div>
                  </div>
                ))}
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

export default AppointmentReport;
