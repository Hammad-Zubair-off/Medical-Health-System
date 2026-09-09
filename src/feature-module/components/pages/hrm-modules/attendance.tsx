import { useMemo, useState } from "react";
import { Link } from "react-router";
import PredefinedDatePicker from "../../../../core/common/datePicker";
import SearchInput from "../../../../core/common/dataTable/dataTableSearch";
import Datatable from "../../../../core/common/dataTable";
import { useAttendance } from "./hooks/useAttendance";
import { useStaff } from "./hooks/useStaff";
import { formatDate } from "../../../../core/utils/display.utils";
import { toDate } from "../../../../core/utils/firestore.utils";

function formatTime(value: Date | { toDate: () => Date } | null | undefined): string {
  const d = toDate(value as Date | null | undefined);
  if (!d) return "—";
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

const AttendanceList = () => {
  const now = new Date();
  const fromDate = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  const toDateStr = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);

  const { records, loading, error } = useAttendance({
    fromDate,
    toDate: toDateStr,
  });
  const { staff } = useStaff();
  const [searchText, setSearchText] = useState("");

  const staffById = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of staff) map.set(s._id, s.displayName);
    return map;
  }, [staff]);

  const data = useMemo(
    () =>
      records.map((r) => ({
        key: r._id,
        Staff: r.staffName || staffById.get(r.staffId) || "—",
        Date: formatDate(r.date),
        CheckIn: formatTime(r.checkIn),
        CheckOut: formatTime(r.checkOut),
        Status: r.status.charAt(0).toUpperCase() + r.status.slice(1),
        Worked: `${Math.floor(r.workedMinutes / 60)}h ${r.workedMinutes % 60}m`,
      })),
    [records, staffById]
  );

  const columns = [
    {
      title: "Staff",
      dataIndex: "Staff",
      sorter: (a: { Staff: string }, b: { Staff: string }) =>
        a.Staff.localeCompare(b.Staff),
    },
    {
      title: "Date",
      dataIndex: "Date",
      sorter: (a: { Date: string }, b: { Date: string }) =>
        a.Date.localeCompare(b.Date),
    },
    { title: "Check In", dataIndex: "CheckIn" },
    { title: "Check Out", dataIndex: "CheckOut" },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: string) => (
        <span
          className={`badge badge-sm border fw-medium ${
            text === "Present"
              ? "badge-soft-success border-success"
              : text === "Absent"
                ? "badge-soft-danger border-danger"
                : text === "Holiday"
                  ? "badge-soft-info border-info"
                  : "badge-soft-warning border-warning"
          }`}
        >
          {text}
        </span>
      ),
    },
    { title: "Worked", dataIndex: "Worked" },
  ];

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="mb-3 pb-3 border-bottom">
            <h4 className="fw-bold mb-0">
              Attendance{" "}
              <span className="badge badge-soft-primary border ms-2">
                {loading ? "…" : data.length}
              </span>
            </h4>
          </div>
          <div className="d-flex align-items-center justify-content-between flex-wrap mb-3">
            <div className="d-flex align-items-center gap-2">
              <SearchInput value={searchText} onChange={setSearchText} />
              <PredefinedDatePicker />
            </div>
            <div className="d-flex align-items-center flex-wrap row-gap-3">
              <span className="badge badge-sm badge-soft-success border border-success fw-medium me-2">
                Present
              </span>
              <span className="badge badge-sm badge-soft-danger border border-danger fw-medium me-2">
                Absent
              </span>
              <span className="badge badge-sm badge-soft-info border border-info fw-medium">
                Holiday
              </span>
            </div>
          </div>
          {error ? <div className="alert alert-danger">{error}</div> : null}
          <div className="table-responsive">
            <Datatable
              columns={columns}
              dataSource={data}
              Selection={false}
              searchText={searchText}
            />
          </div>
        </div>
        <div className="footer text-center bg-white p-2 border-top">
          <p className="text-dark mb-0">
            2025 ©
            <Link to="#" className="link-primary">
              Doctoury
            </Link>
            , All Rights Reserved
          </p>
        </div>
      </div>
    </>
  );
};

export default AttendanceList;
