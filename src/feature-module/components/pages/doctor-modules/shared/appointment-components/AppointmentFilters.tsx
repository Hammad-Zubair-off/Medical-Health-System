import { Link } from "react-router";
import { useState } from "react";
import { DatePicker, Select } from "antd";
import type { FilterValues } from "../appointment-types";
import { Status } from "../../../../../../core/common/selectOption";

interface AppointmentFiltersProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (filters: FilterValues) => void;
  onSortChange: (sortBy: string) => void;
  showSearch?: boolean;
}

const AppointmentFilters = ({
  searchText,
  onSearchChange,
  onFilterChange,
  onSortChange,
  showSearch = true,
}: AppointmentFiltersProps) => {
  const [filters, setFilters] = useState<FilterValues>({});
  const [sortBy, setSortBy] = useState<string>("recent");

  const getModalContainer = () => {
    const modalElement = document.getElementById("modal-datepicker");
    return modalElement ? modalElement : document.body;
  };

  const handleFilterChange = (key: keyof FilterValues, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = (key: keyof FilterValues) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    onSortChange(value);
  };

  return (
    <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mb-3">
      {showSearch && (
        <div className="flex-grow-1 me-3" style={{ maxWidth: "300px" }}>
          <div className="input-icon-start position-relative">
            <span className="input-icon-addon">
              <i className="ti ti-search" />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search appointments..."
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      )}
      <div className="d-flex gap-2 align-items-center">
        {/* Sort By */}
        <div className="dropdown">
          <Link
            to="#"
            className="btn btn-md fs-14 fw-normal border bg-white rounded text-dark d-inline-flex align-items-center"
            data-bs-toggle="dropdown"
          >
            Sort By : {sortBy === "recent" ? "Recent" : sortBy === "ascending" ? "Ascending" : sortBy === "descending" ? "Descending" : sortBy === "lastMonth" ? "Last Month" : "Last 7 Days"}
            <i className="ti ti-chevron-down ms-2" />
          </Link>
          <ul className="dropdown-menu p-2">
            <li>
              <Link
                className="dropdown-item"
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleSortChange("recent");
                }}
              >
                Recent
              </Link>
            </li>
            <li>
              <Link
                className="dropdown-item"
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleSortChange("ascending");
                }}
              >
                Ascending
              </Link>
            </li>
            <li>
              <Link
                className="dropdown-item"
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleSortChange("descending");
                }}
              >
                Descending
              </Link>
            </li>
            <li>
              <Link
                className="dropdown-item"
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleSortChange("lastMonth");
                }}
              >
                Last Month
              </Link>
            </li>
            <li>
              <Link
                className="dropdown-item"
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleSortChange("last7Days");
                }}
              >
                Last 7 Days
              </Link>
            </li>
          </ul>
        </div>
        {/* Filters Button */}
        <div className="dropdown">
          <Link
            to="#"
            className="btn btn-md fs-14 fw-normal border bg-white rounded text-dark d-inline-flex align-items-center"
            data-bs-toggle="dropdown"
          >
            Filters
            <i className="ti ti-chevron-down ms-2" />
          </Link>
          <div className="dropdown-menu dropdown-menu-end p-3" style={{ width: "300px" }}>
            <div className="filter-body pb-0">
              <div className="mb-3">
                <div className="d-flex align-items-center justify-content-between">
                  <label className="form-label">Status</label>
                  <Link
                    to="#"
                    className="link-primary mb-1"
                    onClick={(e) => {
                      e.preventDefault();
                      handleReset("statuses");
                    }}
                  >
                    Reset
                  </Link>
                </div>
                <Select
                  mode="multiple"
                  allowClear
                  style={{ width: "100%" }}
                  placeholder="Please select"
                  value={filters.statuses}
                  options={Status}
                  onChange={(value) => handleFilterChange("statuses", value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label mb-1 text-dark fs-14 fw-medium">
                  Date
                </label>
                <DatePicker
                  className="form-control datetimepicker"
                  format={{
                    format: "DD-MM-YYYY",
                    type: "mask",
                  }}
                  getPopupContainer={getModalContainer}
                  placeholder="DD-MM-YYYY"
                  suffixIcon={null}
                  onChange={(date) => {
                    handleFilterChange("date", date ? date.format("DD-MM-YYYY") : undefined);
                  }}
                />
              </div>
            </div>
            <div className="filter-footer d-flex align-items-center justify-content-end border-top mt-3 pt-3">
              <Link
                to="#"
                className="btn btn-light btn-sm me-2"
                onClick={(e) => {
                  e.preventDefault();
                  setFilters({});
                  onFilterChange({});
                }}
              >
                Reset All
              </Link>
              <Link
                to="#"
                className="btn btn-primary btn-sm"
                data-bs-dismiss="dropdown"
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                Apply
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentFilters;

