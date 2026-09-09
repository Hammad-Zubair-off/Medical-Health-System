import { useMemo, useState } from "react";
import { Link } from "react-router";
import Datatable from "../../../../../core/common/dataTable";
import type { LocationFormValues } from "../../../../../core/types/location.types";
import { useLocations } from "./hooks/useLocations";

const Locations = () => {
  const {
    locations,
    loading,
    error,
    submitting,
    addLocation,
    deactivateLocation,
  } = useLocations();
  const [name, setName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const dataSource = useMemo(
    () =>
      locations.map((row) => ({
        key: row._id,
        _id: row._id,
        Clinic_Name: row.name,
        Address: row.address
          ? [row.address.line1, row.address.line2, row.address.city, row.address.state, row.address.country, row.address.postalCode]
              .filter(Boolean)
              .join(", ")
          : "—",
        Status: row.status === "active" ? "Active" : "Inactive",
        Span: row.status === "active" ? "Active" : "Inactive",
      })),
    [locations]
  );

  const columns = [
    {
      title: "Clinic Name",
      dataIndex: "Clinic_Name",
      render: (text: string, render: (typeof dataSource)[number]) => (
        <div className="d-flex align-items-center">
          <span className="text-dark fw-semibold">{text}</span>
          <span
            className={`badge fw-medium ms-2 ${
              render.Status === "Active"
                ? "badge-soft-success border border-success"
                : "badge-soft-danger border border-danger"
            }`}
          >
            {render.Span}
          </span>
        </div>
      ),
    },
    { title: "Address", dataIndex: "Address" },
    {
      title: "",
      render: (_: unknown, row: (typeof dataSource)[number]) =>
        row.Status === "Active" ? (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            disabled={submitting}
            onClick={() => void deactivateLocation(row._id)}
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
              Locations
              <span className="badge badge-soft-primary fw-medium border py-1 px-2 border-primary fs-13 ms-1">
                Total Location : {locations.length}
              </span>
            </h4>
          </div>
        </div>

        <div className="card mb-3">
          <div className="card-body">
            <h6 className="fw-bold mb-3">Add location</h6>
            {formError && <div className="alert alert-danger">{formError}</div>}
            <form
              className="row g-2 align-items-end"
              onSubmit={async (e) => {
                e.preventDefault();
                setFormError(null);
                if (!name.trim() || !addressLine1.trim() || !city.trim() || !state.trim() || !country.trim()) {
                  setFormError("Name and full address are required");
                  return;
                }
                const values: LocationFormValues = {
                  name: name.trim(),
                  addressLine1: addressLine1.trim(),
                  addressLine2: "",
                  city: city.trim(),
                  state: state.trim(),
                  country: country.trim(),
                  postalCode: "",
                  phoneNumber: "",
                  email: "",
                  status: "active",
                };
                await addLocation(values);
                setName("");
                setAddressLine1("");
                setCity("");
                setState("");
                setCountry("");
              }}
            >
              <div className="col-md-3">
                <label className="form-label">Name</label>
                <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} disabled={submitting} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Address</label>
                <input className="form-control" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} disabled={submitting} />
              </div>
              <div className="col-md-2">
                <label className="form-label">City</label>
                <input className="form-control" value={city} onChange={(e) => setCity(e.target.value)} disabled={submitting} />
              </div>
              <div className="col-md-2">
                <label className="form-label">State</label>
                <input className="form-control" value={state} onChange={(e) => setState(e.target.value)} disabled={submitting} />
              </div>
              <div className="col-md-1">
                <label className="form-label">Country</label>
                <input className="form-control" value={country} onChange={(e) => setCountry(e.target.value)} disabled={submitting} />
              </div>
              <div className="col-md-1">
                <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {loading && <div className="alert alert-info">Loading locations…</div>}

        {!loading && (
          <div className="table-responsive">
            <Datatable columns={columns} dataSource={dataSource} Selection={false} searchText="" />
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

export default Locations;
