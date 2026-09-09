import { useMemo, useState } from "react";
import { Link } from "react-router";
import Datatable from "../../../../../core/common/dataTable";
import SearchInput from "../../../../../core/common/dataTable/dataTableSearch";
import { formatDate } from "../../../../../core/utils/display.utils";
import { formatMoney } from "../../../../../core/utils/money.utils";
import type { AssetFormValues } from "../../../../../core/types/asset.types";
import { useAssets } from "./hooks/useAssets";

const Assets = () => {
  const { assets, loading, error, submitting, addAsset, deactivateAsset } = useAssets();
  const [searchText, setSearchText] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [purchaseCost, setPurchaseCost] = useState("0");
  const [formError, setFormError] = useState<string | null>(null);

  const dataSource = useMemo(
    () =>
      assets.map((row) => ({
        key: row._id,
        _id: row._id,
        AssetID: row.assetId || row._id.slice(0, 8),
        Assets: row.name,
        Category: row.category || "—",
        PurchaseDate: formatDate(row.purchaseDate),
        Amount: formatMoney(Math.round(row.purchaseCost || 0)),
        amountMinor: Math.round(row.purchaseCost || 0),
        Status: row.status === "active" ? "Active" : row.status === "retired" ? "Retired" : "Inactive",
      })),
    [assets]
  );

  const columns = [
    {
      title: "Asset ID",
      dataIndex: "AssetID",
      render: (text: string) => <span className="fw-semibold">{text}</span>,
    },
    { title: "Asset", dataIndex: "Assets" },
    { title: "Category", dataIndex: "Category" },
    { title: "Purchase Date", dataIndex: "PurchaseDate" },
    {
      title: "Amount",
      dataIndex: "Amount",
      sorter: (a: { amountMinor: number }, b: { amountMinor: number }) =>
        a.amountMinor - b.amountMinor,
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: string) => (
        <span
          className={`badge ${
            text === "Active"
              ? "badge-soft-success text-success border-success"
              : "badge-soft-danger text-danger border-danger"
          } rounded fw-medium border`}
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
            onClick={() => void deactivateAsset(row._id)}
          >
            Deactivate
          </button>
        ) : null,
    },
  ];

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 pb-3 mb-3 border-1 border-bottom">
          <div className="flex-grow-1">
            <h4 className="fw-bold mb-0">
              Assets
              <span className="badge badge-soft-primary fw-medium border py-1 px-2 border-primary fs-13 ms-1">
                Asset List : {assets.length}
              </span>
            </h4>
          </div>
        </div>

        <div className="card mb-3">
          <div className="card-body">
            <h6 className="fw-bold mb-3">Add asset</h6>
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
                const cost = Number(purchaseCost);
                if (!Number.isFinite(cost) || cost < 0) {
                  setFormError("Enter a valid purchase cost");
                  return;
                }
                const values: AssetFormValues = {
                  name: name.trim(),
                  category: category.trim(),
                  serialNumber: "",
                  purchaseDate: new Date().toISOString().slice(0, 10),
                  purchaseCost: cost,
                  assignedToStaffId: "",
                  locationId: "",
                  status: "active",
                };
                await addAsset(values);
                setName("");
                setCategory("");
                setPurchaseCost("0");
              }}
            >
              <div className="col-md-4">
                <label className="form-label">Name</label>
                <input
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Category</label>
                <input
                  className="form-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Purchase cost</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className="form-control"
                  value={purchaseCost}
                  onChange={(e) => setPurchaseCost(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="col-md-2">
                <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                  {submitting ? "Saving…" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {loading && <div className="alert alert-info">Loading assets…</div>}

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

export default Assets;
