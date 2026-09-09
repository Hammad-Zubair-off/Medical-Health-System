import { useMemo, useState } from "react";
import { Link } from "react-router";
import Datatable from "../../../../../core/common/dataTable";
import SearchInput from "../../../../../core/common/dataTable/dataTableSearch";
import { formatMoney } from "../../../../../core/utils/money.utils";
import type { ServiceFormValues } from "../../../../../core/types/service.types";
import { useServices } from "./hooks/useServices";

const Services = () => {
  const { services, loading, error, submitting, addService, deactivateService } = useServices();
  const [searchText, setSearchText] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("0");
  const [durationMinutes, setDurationMinutes] = useState("30");
  const [formError, setFormError] = useState<string | null>(null);

  const dataSource = useMemo(
    () =>
      services.map((row) => ({
        key: row._id,
        _id: row._id,
        ServiceName: row.name,
        Department: row.specializationName || "—",
        Price: formatMoney(Math.round(row.price || 0)),
        priceMinor: Math.round(row.price || 0),
        Duration: row.durationMinutes != null ? `${row.durationMinutes} min` : "—",
        Status: row.status === "active" ? "Active" : "Inactive",
      })),
    [services]
  );

  const columns = [
    {
      title: "Service Name",
      dataIndex: "ServiceName",
      sorter: (a: { ServiceName: string }, b: { ServiceName: string }) =>
        a.ServiceName.localeCompare(b.ServiceName),
    },
    { title: "Department", dataIndex: "Department" },
    {
      title: "Price",
      dataIndex: "Price",
      sorter: (a: { priceMinor: number }, b: { priceMinor: number }) =>
        a.priceMinor - b.priceMinor,
    },
    { title: "Duration", dataIndex: "Duration" },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: string) => (
        <span
          className={`badge ${
            text === "Active"
              ? "badge-soft-success border-success"
              : "badge-soft-danger border-danger"
          } border px-2 py-1 fs-13 fw-medium`}
        >
          {text}
        </span>
      ),
    },
    {
      title: "",
      render: (_: unknown, row: (typeof dataSource)[number]) =>
        row.Status === "Active" ? (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            disabled={submitting}
            onClick={() => void deactivateService(row._id)}
          >
            Deactivate
          </button>
        ) : null,
    },
  ];

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
          <div className="flex-grow-1">
            <h4 className="fw-bold mb-0">
              Services
              <span className="badge badge-soft-primary border border-primary fs-13 fw-medium ms-2">
                Total Services : {services.length}
              </span>
            </h4>
          </div>
        </div>

        <div className="card mb-3">
          <div className="card-body">
            <h6 className="fw-bold mb-3">Add service</h6>
            {formError && <div className="alert alert-danger">{formError}</div>}
            <form
              className="row g-2 align-items-end"
              onSubmit={async (e) => {
                e.preventDefault();
                setFormError(null);
                if (!name.trim()) {
                  setFormError("Name is required");
                  return;
                }
                const priceNum = Number(price);
                const duration = Number(durationMinutes);
                if (!Number.isFinite(priceNum) || priceNum < 0) {
                  setFormError("Enter a valid price");
                  return;
                }
                const values: ServiceFormValues = {
                  name: name.trim(),
                  specializationId: "",
                  price: priceNum,
                  durationMinutes: Number.isFinite(duration) ? duration : 30,
                  description: "",
                  status: "active",
                };
                await addService(values);
                setName("");
                setPrice("0");
                setDurationMinutes("30");
              }}
            >
              <div className="col-md-4">
                <label className="form-label">Name</label>
                <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} disabled={submitting} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Price</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className="form-control"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Duration (min)</label>
                <input
                  type="number"
                  min={0}
                  className="form-control"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="col-md-2">
                <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {loading && <div className="alert alert-info">Loading services…</div>}

        <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mb-3">
          <div className="search-set">
            <SearchInput value={searchText} onChange={setSearchText} />
          </div>
        </div>

        {!loading && (
          <div className="table-responsive">
            <Datatable
              columns={columns}
              dataSource={dataSource}
              Selection={false}
              searchText={searchText}
            />
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

export default Services;
