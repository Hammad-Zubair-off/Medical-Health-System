import { Link } from "react-router";
import { useState, useEffect } from "react";
import { DatePicker, Select } from "antd";
import type { Dayjs } from "dayjs";
import type { ReviewFilters as ReviewFiltersType } from "../review-types";

interface ReviewsFiltersProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (filters: ReviewFiltersType) => void;
  onSortChange: (sortBy: string) => void;
}

const ReviewsFilters = ({
  searchText,
  onSearchChange,
  onFilterChange,
  onSortChange,
}: ReviewsFiltersProps) => {
  const [filters, setFilters] = useState<ReviewFiltersType>({});
  const [sortBy, setSortBy] = useState<string>("recent");

  const getModalContainer = () => {
    const modalElement = document.getElementById("modal-datepicker");
    return modalElement ? modalElement : document.body;
  };

  const handleFilterChange = (key: keyof ReviewFiltersType, value: number[] | string | Dayjs | undefined) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Update search filter when search text changes
  useEffect(() => {
    const newFilters = { ...filters, search: searchText };
    setFilters(newFilters);
    onFilterChange(newFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const handleSortChange = (value: string) => {
    setSortBy(value);
    onSortChange(value);
  };

  const ratingOptions = [
    { value: 5, label: "5 Stars" },
    { value: 4, label: "4 Stars" },
    { value: 3, label: "3 Stars" },
    { value: 2, label: "2 Stars" },
    { value: 1, label: "1 Star" },
  ];

  return (
    <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mb-3">
      <div className="flex-grow-1 me-3" style={{ maxWidth: "300px" }}>
        <div className="input-icon-start position-relative">
          <span className="input-icon-addon">
            <i className="ti ti-search" />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search reviews..."
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <div className="d-flex gap-2 align-items-center">
        {/* Sort By */}
        <div className="dropdown">
          <Link
            to="#"
            className="btn btn-md fs-14 fw-normal border bg-white rounded text-dark d-inline-flex align-items-center"
            data-bs-toggle="dropdown"
          >
            Sort By : {sortBy === "recent" ? "Recent" : sortBy === "highest" ? "Highest Rating" : "Lowest Rating"}
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
                  handleSortChange("highest");
                }}
              >
                Highest Rating
              </Link>
            </li>
            <li>
              <Link
                className="dropdown-item"
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleSortChange("lowest");
                }}
              >
                Lowest Rating
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
                <label className="form-label">Rating</label>
                <Select
                  mode="multiple"
                  allowClear
                  style={{ width: "100%" }}
                  placeholder="Please select"
                  value={filters.rating}
                  options={ratingOptions}
                  onChange={(value) => handleFilterChange("rating", value)}
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
                  onChange={(date: Dayjs | null) => {
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

export default ReviewsFilters;

