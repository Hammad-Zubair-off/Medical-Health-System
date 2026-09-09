import { useCallback } from "react";
import { Link } from "react-router";
import { getProfitAndLoss } from "../../../../../../core/services/firestore/report.service";
import { useReport } from "../hooks/useReport";
import DateRangeFilter from "../shared/DateRangeFilter";

function trendLabel(pct: number) {
  const rounded = Math.round(pct * 10) / 10;
  const positive = rounded >= 0;
  return (
    <span className={positive ? "text-success" : "text-danger"}>
      <i className={`ti ti-arrow-${positive ? "up" : "down"}-right me-1`} />
      {positive ? "+" : ""}
      {rounded}%
    </span>
  );
}

const ProfitAndLoss = () => {
  const fetcher = useCallback((range: { from: Date; to: Date }) => getProfitAndLoss(range), []);
  const { range, setRange, data, loading, error } = useReport(fetcher);

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
          <div className="flex-grow-1">
            <h4 className="fw-bold mb-0">Profit &amp; Loss Report</h4>
          </div>
        </div>

        <div className="card mb-3">
          <div className="card-body">
            <DateRangeFilter value={range} onChange={setRange} disabled={loading} />
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {loading && <div className="alert alert-info">Calculating profit &amp; loss…</div>}

        {!loading && data && (
          <div className="row">
            <div className="col-xl-4 col-md-6 d-flex">
              <div className="card shadow-sm flex-fill w-100">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div>
                      <p className="mb-1 text-truncate">Total Income</p>
                      <h6 className="mb-2 fw-bold">{data.incomeFormatted}</h6>
                    </div>
                    <span className="avatar avatar-lg bg-primary text-white rounded-circle border border-primary flex-shrink-0">
                      <i className="ti ti-arrow-up-right-circle fs-24" />
                    </span>
                  </div>
                  <div className="p-2 rounded bg-light text-center">
                    <p className="mb-0 fs-13">
                      {trendLabel(data.incomeChangePct)} vs prior period
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-md-6 d-flex">
              <div className="card shadow-sm flex-fill w-100">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div>
                      <p className="mb-1 text-truncate">Total Expenses</p>
                      <h6 className="mb-2 fw-bold">{data.expenseFormatted}</h6>
                    </div>
                    <span className="avatar avatar-lg bg-success text-white rounded-circle border border-success flex-shrink-0">
                      <i className="ti ti-arrow-down-right-circle fs-24" />
                    </span>
                  </div>
                  <div className="p-2 rounded bg-light text-center">
                    <p className="mb-0 fs-13">
                      {trendLabel(data.expenseChangePct)} vs prior period
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-md-6 d-flex">
              <div className="card shadow-sm flex-fill w-100">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div>
                      <p className="mb-1 text-truncate">Net Profit</p>
                      <h6 className="mb-2 fw-bold">{data.profitFormatted}</h6>
                    </div>
                    <span className="avatar avatar-lg bg-info text-white rounded-circle border border-info flex-shrink-0">
                      <i className="ti ti-chart-pie fs-24" />
                    </span>
                  </div>
                  <div className="p-2 rounded bg-light text-center">
                    <p className="mb-0 fs-13">
                      {trendLabel(data.profitChangePct)} vs prior period
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
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

export default ProfitAndLoss;
