import { useMemo, useState } from "react";
import { Link } from "react-router";
import ImageWithBasePath from "../../../../../core/imageWithBasePath";
import FilterIndex from "../../../../../core/common/filter/filterIndex";
import SearchInput from "../../../../../core/common/dataTable/dataTableSearch";
import {
  all_routes,
  editInvoicesPath,
  invoicesDetailsPath,
} from "../../../../routes/all_routes";
import Datatable from "../../../../../core/common/dataTable";
import { useInvoices } from "../hooks/useInvoices";
import { formatDate } from "../../../../../core/utils/display.utils";
import { formatMoney } from "../../../../../core/utils/money.utils";
import { invoiceStatusLabel } from "../../../../../core/utils/invoice.utils";

const InvoicesList = () => {
  const { invoices, loading, error, search, setSearch } = useInvoices();
  const [searchText, setSearchText] = useState<string>("");

  const data = useMemo(
    () =>
      invoices.map((inv) => ({
        key: inv._id,
        InvoiceID: inv.invoiceNumber || inv._id,
        Patient: inv.patientName || "—",
        Image: "user-01.jpg",
        CreatedDate: formatDate(inv.issuedOn),
        DueDate: formatDate(inv.dueDate),
        Amount: formatMoney(inv.total),
        Status: invoiceStatusLabel(inv.status),
        _id: inv._id,
      })),
    [invoices]
  );

  const columns = [
    {
      title: "Invoice ID",
      dataIndex: "InvoiceID",
      render: (text: string, record: { _id: string }) => (
        <Link to={invoicesDetailsPath(record._id)}>{text}</Link>
      ),
      sorter: (a: { InvoiceID: string }, b: { InvoiceID: string }) =>
        a.InvoiceID.localeCompare(b.InvoiceID),
    },
    {
      title: "Patient",
      dataIndex: "Patient",
      render: (text: string, record: { Image: string }) => (
        <div className="d-flex align-items-center">
          <Link to="#" className="avatar avatar-md me-2">
            <ImageWithBasePath
              src={`assets/img/users/${record.Image}`}
              alt="product"
              className="rounded-circle"
            />
          </Link>
          <Link to="#" className="text-dark fw-semibold">
            {text}
          </Link>
        </div>
      ),
      sorter: (a: { Patient: string }, b: { Patient: string }) =>
        a.Patient.localeCompare(b.Patient),
    },
    {
      title: "Created Date",
      dataIndex: "CreatedDate",
      render: (text: string) => <div className="text-dark"> {text} </div>,
      sorter: (a: { CreatedDate: string }, b: { CreatedDate: string }) =>
        a.CreatedDate.localeCompare(b.CreatedDate),
    },
    {
      title: "Due Date",
      dataIndex: "DueDate",
      render: (text: string) => <div className="text-dark"> {text} </div>,
      sorter: (a: { DueDate: string }, b: { DueDate: string }) =>
        a.DueDate.localeCompare(b.DueDate),
    },
    {
      title: "Amount",
      dataIndex: "Amount",
      render: (text: string) => (
        <div className="fw-semibold text-dark"> {text} </div>
      ),
      sorter: (a: { Amount: string }, b: { Amount: string }) =>
        a.Amount.localeCompare(b.Amount),
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: string) => (
        <span
          className={`badge border ${
            text === "Paid"
              ? "badge-soft-success border-success text-success"
              : text === "Partially Paid"
              ? "badge-soft-warning border-warning text-warning"
              : "badge-soft-danger border-danger text-danger"
          } rounded fw-medium`}
        >
          {text}
        </span>
      ),
      sorter: (a: { Status: string }, b: { Status: string }) =>
        a.Status.localeCompare(b.Status),
    },
    {
      title: "",
      render: (_: unknown, record: { _id: string }) => (
        <div className="action-item p-2">
          <Link to="#" data-bs-toggle="dropdown">
            <i className="ti ti-dots-vertical" />
          </Link>
          <ul className="dropdown-menu p-2">
            <li>
              <Link
                to={invoicesDetailsPath(record._id)}
                className="dropdown-item d-flex align-items-center"
              >
                View details
              </Link>
            </li>
            <li>
              <Link
                to={editInvoicesPath(record._id)}
                className="dropdown-item d-flex align-items-center"
              >
                Edit
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
            <li>
              <Link
                to="#"
                className="dropdown-item d-flex align-items-center"
                data-bs-toggle="modal"
                data-bs-target="#edit_new_payment"
              >
                Download
              </Link>
            </li>
          </ul>
        </div>
      ),
    },
  ];

  const handleSearch = (value: string) => {
    setSearchText(value);
    setSearch(value);
  };

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 pb-3 mb-3 border-1 border-bottom">
            <div className="flex-grow-1">
              <h4 className="fw-bold mb-0">
                {" "}
                Invoices{" "}
                <span className="badge badge-soft-primary fw-medium border py-1 px-2 border-primary fs-13 ms-1">
                  Total Invoices : {loading ? "…" : data.length}
                </span>{" "}
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
              <Link
                to={all_routes.addInvoices}
                className="btn btn-primary ms-2 fs-13 btn-md"
              >
                <i className="ti ti-plus me-1" />
                New Invoices{" "}
              </Link>
            </div>
          </div>
          {error ? (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          ) : null}
          <div className=" d-flex align-items-center justify-content-between flex-wrap row-gap-3">
            <div className="d-flex align-items-center gap-2">
              <div className="search-set mb-3">
                <div className="d-flex align-items-center flex-wrap gap-2">
                  <div className="table-search d-flex align-items-center mb-0">
                    <div className="search-input">
                      <SearchInput
                        value={searchText || search}
                        onChange={handleSearch}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="d-flex table-dropdown mb-3 pb-1 right-content align-items-center flex-wrap row-gap-3">
              <div className="dropdown me-2">
                <Link
                  to="#"
                  className="bg-white border rounded btn btn-md text-dark fs-14 py-1 align-items-center d-flex fw-normal"
                  data-bs-toggle="dropdown"
                  data-bs-auto-close="outside"
                >
                  <i className="ti ti-filter text-gray-5 me-1" />
                  Filters
                </Link>
                <div
                  className="dropdown-menu dropdown-lg dropdown-menu-end filter-dropdown p-0"
                  id="filter-dropdown"
                >
                  <div className="d-flex align-items-center justify-content-between border-bottom filter-header">
                    <h4 className="mb-0 fw-bold">Filter</h4>
                    <div className="d-flex align-items-center">
                      <Link
                        to="#"
                        className="link-danger text-decoration-underline"
                      >
                        Clear All
                      </Link>
                    </div>
                  </div>
                  <FilterIndex />
                </div>
              </div>
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
          <div className="table-responsive">
            {loading && data.length === 0 ? (
              <p className="text-muted">Loading invoices…</p>
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
        <div className="footer text-center bg-white p-2 border-top">
          <p className="text-dark mb-0">
            2025 ©{" "}
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

export default InvoicesList;
