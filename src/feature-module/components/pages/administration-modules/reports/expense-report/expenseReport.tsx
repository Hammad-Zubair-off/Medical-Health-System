import { useCallback } from "react";
import { Link } from "react-router";
import Datatable from "../../../../../../core/common/dataTable";
import { formatMoney } from "../../../../../../core/utils/money.utils";
import { getExpenseReport } from "../../../../../../core/services/firestore/report.service";
import { useReport } from "../hooks/useReport";
import DateRangeFilter from "../shared/DateRangeFilter";

const ExpenseReport = () => {
  const fetcher = useCallback((range: { from: Date; to: Date }) => getExpenseReport(range), []);
  const { range, setRange, data, loading, error } = useReport(fetcher);

  const columns = [
    {
      title: "Expense",
      dataIndex: "Expense",
      sorter: (a: { Expense: string }, b: { Expense: string }) =>
        a.Expense.localeCompare(b.Expense),
    },
    {
      title: "Category",
      dataIndex: "Category",
      sorter: (a: { Category: string }, b: { Category: string }) =>
        a.Category.localeCompare(b.Category),
    },
    {
      title: "Amount",
      dataIndex: "Amount",
      render: (text: string) => <p className="text-dark fw-medium mb-0">{text}</p>,
      sorter: (a: { amountMinor: number }, b: { amountMinor: number }) =>
        a.amountMinor - b.amountMinor,
    },
    {
      title: "Date",
      dataIndex: "Date",
      sorter: (a: { Date: string }, b: { Date: string }) => a.Date.localeCompare(b.Date),
    },
    {
      title: "Vendor",
      dataIndex: "Vendor",
      sorter: (a: { Vendor: string }, b: { Vendor: string }) =>
        a.Vendor.localeCompare(b.Vendor),
    },
    {
      title: "Payment Method",
      dataIndex: "PaymentMethod",
      sorter: (a: { PaymentMethod: string }, b: { PaymentMethod: string }) =>
        a.PaymentMethod.localeCompare(b.PaymentMethod),
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: string) => (
        <span className="badge badge-soft-success border-success border px-2 py-1 fs-13 fw-medium">
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
            <h4 className="fw-bold mb-0">Expense Report</h4>
          </div>
        </div>

        <div className="card mb-3">
          <div className="card-body">
            <DateRangeFilter value={range} onChange={setRange} disabled={loading} />
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {data?.message && <div className="alert alert-warning">{data.message}</div>}
        {loading && <div className="alert alert-info">Loading expenses…</div>}

        {!loading && data && (
          <>
            <div className="row mb-3">
              <div className="col-md-4">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <p className="mb-1 text-muted">Total expenses</p>
                    <h5 className="mb-0 fw-bold">{formatMoney(data.totalMinor)}</h5>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <p className="mb-1 text-muted">Entries</p>
                    <h5 className="mb-0 fw-bold">{data.docCount}</h5>
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

export default ExpenseReport;
