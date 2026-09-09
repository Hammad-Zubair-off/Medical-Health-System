import { useMemo } from "react";
import { Link } from "react-router";
import Datatable from "../../../../core/common/dataTable";
import HolidaysModal from "./modal/holidaysModal";
import { useHolidays } from "./hooks/useHolidays";
import { formatDate } from "../../../../core/utils/display.utils";
import { toDate } from "../../../../core/utils/firestore.utils";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const HolidaysList = () => {
  const { holidays, loading, error } = useHolidays();
  const data = useMemo(
    () =>
      holidays.map((h) => {
        const d = toDate(h.date);
        return {
          key: h._id,
          id: h._id,
          Name: h.name + (h.isRecurring ? " (recurring)" : ""),
          Date: formatDate(h.date),
          Days: d ? DAY_NAMES[d.getDay()] : "—",
        };
      }),
    [holidays]
  );
  const columns = [
    {
      title: "Name",
      dataIndex: "Name",
      sorter: (a: any, b: any) => a.Name.length - b.Name.length,
    },
    {
      title: "Date",
      dataIndex: "Date",
      sorter: (a: any, b: any) => a.Date.length - b.Date.length,
    },
    {
      title: "Days",
      dataIndex: "Days",
      sorter: (a: any, b: any) => a.Days.length - b.Days.length,
    },
    {
      title: "",
      render: () => (
        <div className="action-item p-2">
          <Link
            to="#"
            data-bs-toggle="dropdown"
            className="btn p-1 btn-white border"
          >
            <i className="ti ti-dots-vertical" />
          </Link>
          <ul className="dropdown-menu p-2">
            <li>
              <Link
                to="#"
                className="dropdown-item d-flex align-items-center"
                data-bs-toggle="modal"
                data-bs-target="#edit_holiday"
              >
                Edit
              </Link>
            </li>
            <li>
              <Link
                to="#"
                className="dropdown-item d-flex align-items-center"
                data-bs-toggle="modal"
                data-bs-target="#delete_holiday"
              >
                Delete
              </Link>
            </li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* ========================
			Start Page Content
		========================= */}
      <div className="page-wrapper">
        {/* Start Content */}
        <div className="content" id="profilePage">
          {/* Page Header */}
          <div className="mb-3 border-bottom pb-3">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <h4 className="fw-bold mb-0 me-2">Holidays</h4>
                <span className="badge badge-soft-primary border border-primary fw-medium">
                  Total Holidays : {loading ? "…" : data.length}
                </span>
              </div>
              <Link
                to="#"
                className="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#add_holiday"
              >
                <i className="ti ti-plus me-1" />
                Add Holiday
              </Link>
            </div>
          </div>
          {/* End Page Header */}
          {/* Table List */}
          <div className="table-responsive border">
            {error ? <div className="alert alert-danger">{error}</div> : null}
            <Datatable
              columns={columns}
              dataSource={data}
              Selection={false}
              searchText={""}
            />
          </div>
          {/* /Table List */}
        </div>
        {/* End Content */}
      </div>
      {/* ========================
			End Page Content
		========================= */}

      <HolidaysModal />
    </>
  );
};

export default HolidaysList;
