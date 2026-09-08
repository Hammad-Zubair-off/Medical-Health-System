import { useMemo, useState } from "react";
import SearchInput from "../../../../../core/common/dataTable/dataTableSearch";
import Datatable from "../../../../../core/common/dataTable";
import { useSpecializations } from "./hooks/useSpecializations";
import { formatDate } from "../../../../../core/utils/display.utils";
import type { SpecializationFormValues } from "../../../../../core/types/specialization.types";

const Specializations = () => {
  const {
    specializations,
    loading,
    error,
    submitting,
    addSpecialization,
    saveSpecialization,
  } = useSpecializations();
  const [searchText, setSearchText] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const dataSource = useMemo(
    () =>
      specializations.map((row) => ({
        key: row._id,
        _id: row._id,
        Specialization: row.name,
        CreatedDate: formatDate(row.created),
        Status: row.status === "active" ? "Active" : "Inactive",
      })),
    [specializations]
  );

  const columns = [
    {
      title: "Specialization",
      dataIndex: "Specialization",
      render: (text: string) => <span className="fw-semibold">{text}</span>,
    },
    { title: "Created Date", dataIndex: "CreatedDate" },
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
      render: (_: unknown, render: (typeof dataSource)[number]) => (
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={() => {
            const next: SpecializationFormValues = {
              name: render.Specialization,
              description: "",
              icon: "",
              status: render.Status === "Active" ? "inactive" : "active",
            };
            void saveSpecialization(render._id, next);
          }}
        >
          {render.Status === "Active" ? "Deactivate" : "Activate"}
        </button>
      ),
    },
  ];

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
          <div className="flex-grow-1">
            <h4 className="fw-bold mb-0">
              Specializations
              <span className="badge badge-soft-primary border border-primary fs-13 fw-medium ms-2">
                Total Specializations : {specializations.length}
              </span>
            </h4>
          </div>
        </div>
        <div className="card mb-3">
          <div className="card-body">
            <h6 className="fw-bold mb-3">Add specialization</h6>
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
                try {
                  await addSpecialization({
                    name: name.trim(),
                    description,
                    icon: "",
                    status: "active",
                  });
                  setName("");
                  setDescription("");
                } catch (err) {
                  setFormError(err instanceof Error ? err.message : "Failed to add");
                }
              }}
            >
              <div className="col-md-4">
                <label className="form-label">Name</label>
                <input
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="col-md-5">
                <label className="form-label">Description</label>
                <input
                  className="form-control"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Saving..." : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="search-set mb-3">
          <SearchInput value={searchText} onChange={setSearchText} />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
          </div>
        ) : (
          <Datatable
            columns={columns}
            dataSource={dataSource}
            Selection={false}
            searchText={searchText}
          />
        )}
      </div>
    </div>
  );
};

export default Specializations;
