import { useMemo } from "react";
import { Link } from "react-router";
import Datatable from "../../../../../core/common/dataTable";
import ExpenseCategoryModal from "../modal/expenseCategoryModal";
import { useExpenseCategories } from "../hooks/useExpenseCategories";

const ExpenseCategory = () => {
  const { categories, loading, error } = useExpenseCategories();

  const data = useMemo(
    () =>
      categories.map((c) => ({
        key: c._id,
        Category: c.name || "—",
        Status: c.status === "active" ? "Active" : "Inactive",
      })),
    [categories]
  );

  const columns = [
    {
      title: "Category",
      dataIndex: "Category",
      render: (text: string) => <Link to="#">{text}</Link>,
      sorter: (a: { Category: string }, b: { Category: string }) =>
        a.Category.localeCompare(b.Category),
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: string) => (
        <span
          className={`badge border ${
            text === "Active"
              ? "badge-soft-success border-success text-success"
              : "badge-soft-danger border-danger text-danger"
          } rounded fw-medium fs-13`}
        >
          {text}
        </span>
      ),
      sorter: (a: { Status: string }, b: { Status: string }) =>
        a.Status.localeCompare(b.Status),
    },
    {
      title: "",
      render: () => (
        <div className="action-item p-2">
          <Link to="#" data-bs-toggle="dropdown">
            <i className="ti ti-dots-vertical" />
          </Link>
          <ul className="dropdown-menu p-2">
            <li>
              <Link
                to="#"
                className="dropdown-item d-flex align-items-center"
                data-bs-toggle="modal"
                data-bs-target="#edit_new_category"
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
          </ul>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 pb-3 mb-3 border-1 border-bottom">
            <div className="flex-grow-1">
              <h4 className="fw-bold mb-0"> Expense Category </h4>
            </div>
            <div className="text-end d-flex">
              <Link
                to="#"
                className="btn btn-primary ms-2 fs-13 btn-md"
                data-bs-toggle="modal"
                data-bs-target="#add_new_category"
              >
                <i className="ti ti-plus me-1" />
                Add Category
              </Link>
            </div>
          </div>
          {error ? (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          ) : null}
          <div className="table-responsive">
            {loading && data.length === 0 ? (
              <p className="text-muted">Loading categories…</p>
            ) : (
              <Datatable
                columns={columns}
                dataSource={data}
                Selection={false}
                searchText={""}
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

      <ExpenseCategoryModal />
    </>
  );
};

export default ExpenseCategory;
