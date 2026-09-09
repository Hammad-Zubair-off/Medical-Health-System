import { Link } from "react-router";
import Datatable from "../../../../../core/common/dataTable";
import { useMemo, useState } from "react";
import SearchInput from "../../../../../core/common/dataTable/dataTableSearch";
import Modals from "./modals/modals";
import {
  patientInvoiceDetailsPath,
} from "../../../../routes/all_routes";
import { useAuth } from "../../../../../core/context/AuthContext";
import { useInvoices } from "../../finance-accounts-module/hooks/useInvoices";
import { formatDate } from "../../../../../core/utils/display.utils";
import { formatMoney } from "../../../../../core/utils/money.utils";
import { invoiceStatusLabel } from "../../../../../core/utils/invoice.utils";

const PatientInvoices = () => {
  const { user } = useAuth();
  const { invoices, loading, error } = useInvoices({
    patientUserId: user?.uid,
  });
  const [searchText, setSearchText] = useState<string>("");

  const data = useMemo(
    () =>
      invoices.map((inv) => ({
        key: inv._id,
        _id: inv._id,
        Invoice_ID: inv.invoiceNumber || inv._id,
        Description: inv.notes || inv.doctorName || "Invoice",
        Created_Date: formatDate(inv.issuedOn),
        Due_Date: formatDate(inv.dueDate),
        Amount: formatMoney(inv.total),
        Status: invoiceStatusLabel(inv.status),
      })),
    [invoices]
  );

  const columns = [
    {
      title: "Invoice ID",
      dataIndex: "Invoice_ID",
      render: (text: string, record: { _id: string }) => (
        <Link to={patientInvoiceDetailsPath(record._id)}>{text}</Link>
      ),
      sorter: (a: { Invoice_ID: string }, b: { Invoice_ID: string }) =>
        a.Invoice_ID.localeCompare(b.Invoice_ID),
    },
    {
      title: "Description",
      dataIndex: "Description",
      sorter: (a: { Description: string }, b: { Description: string }) =>
        a.Description.localeCompare(b.Description),
    },
    {
      title: "Created Date",
      dataIndex: "Created_Date",
      sorter: (a: { Created_Date: string }, b: { Created_Date: string }) =>
        a.Created_Date.localeCompare(b.Created_Date),
    },
    {
      title: "Due Date",
      dataIndex: "Due_Date",
      sorter: (a: { Due_Date: string }, b: { Due_Date: string }) =>
        a.Due_Date.localeCompare(b.Due_Date),
    },
    {
      title: "Amount",
      dataIndex: "Amount",
      sorter: (a: { Amount: string }, b: { Amount: string }) =>
        a.Amount.localeCompare(b.Amount),
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: string) => (
        <span
          className={`badge ${
            text === "Paid"
              ? "badge-soft-success"
              : text === "Partially Paid"
              ? "badge-soft-warning"
              : "badge-soft-danger"
          } badge-soft-success d-inline-flex align-items-center`}
        >
          <i className="ti ti-point-filled me-1" />
          {text}
        </span>
      ),
      sorter: (a: { Status: string }, b: { Status: string }) =>
        a.Status.localeCompare(b.Status),
    },
    {
      title: "",
      render: (_: unknown, record: { _id: string }) => (
        <div className="action-item">
          <>
            <Link to="#" data-bs-toggle="dropdown">
              <i className="ti ti-dots-vertical" />
            </Link>
            <ul className="dropdown-menu p-2">
              <li>
                <Link
                  to={patientInvoiceDetailsPath(record._id)}
                  className="dropdown-item d-flex align-items-center"
                >
                  View
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="dropdown-item d-flex align-items-center"
                  data-bs-toggle="modal"
                  data-bs-target="#delete_modal"
                >
                  Delete
                </Link>
              </li>
            </ul>
          </>
        </div>
      ),
    },
  ];

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  return (
    <>
      <div className="page-wrapper">
        <div className="content content-two">
          <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 pb-3 mb-3 border-1 border-bottom">
            <div className="flex-grow-1">
              <h4 className="fw-bold mb-0">
                Invoices
                <span className="badge badge-soft-primary border pt-1 px-2 border-primary fw-medium ms-2 fw-medium fs-13">
                  Total Invoices : {loading ? "…" : data.length}
                </span>
              </h4>
            </div>
            <div className="text-end d-flex">
              <div className="dropdown me-1">
                <Link
                  to="#"
                  className="btn btn-md fs-14 fw-normal border bg-white rounded text-dark d-inline-flex align-items-center"
                  data-bs-toggle="dropdown"
                >
                  Export
                  <i className="ti ti-chevron-down ms-2" />
                </Link>
                <ul className="dropdown-menu p-2">
                  <li>
                    <Link className="dropdown-item" to="#">
                      Download as PDF
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="#">
                      Download as Excel
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {error ? (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          ) : null}
          <div className=" d-flex align-items-center justify-content-between flex-wrap row-gap-3">
            <div className="search-set mb-3">
              <div className="d-flex align-items-center flex-wrap gap-2">
                <div className="table-search d-flex align-items-center mb-0">
                  <div className="search-input">
                    <SearchInput value={searchText} onChange={handleSearch} />
                  </div>
                </div>
              </div>
            </div>
            <div className="d-flex table-dropdown mb-3 pb-1 right-content align-items-center flex-wrap row-gap-3">
              <div className="dropdown">
                <Link
                  to="#"
                  className="dropdown-toggle btn bg-white btn-md d-inline-flex align-items-center fw-normal rounded border text-dark px-2 py-1 fs-14"
                  data-bs-toggle="dropdown"
                >
                  <span className="me-1"> Sort By : </span> Recent
                </Link>
                <ul className="dropdown-menu  dropdown-menu-end p-2">
                  <li>
                    <Link to="#" className="dropdown-item rounded-1">
                      Recent
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="dropdown-item rounded-1">
                      Oldest
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-12">
              <div>
                <div className="card-body p-0">
                  <div className="table-responsive table-nowrap">
                    {loading && data.length === 0 ? (
                      <p className="text-muted p-3">Loading invoices…</p>
                    ) : (
                      <Datatable
                        columns={columns}
                        dataSource={data}
                        Selection={false}
                        searchText={searchText}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
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
      <Modals />
    </>
  );
};

export default PatientInvoices;
