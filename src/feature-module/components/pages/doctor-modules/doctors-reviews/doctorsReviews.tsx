import { useState } from "react";
import { Link } from "react-router";
import ReviewsHeader from "../shared/review-components/ReviewsHeader";
import ReviewsFilters from "../shared/review-components/ReviewsFilters";
import ReviewsTable from "../shared/review-components/ReviewsTable";
import ReviewDetailsModal from "../shared/review-components/ReviewDetailsModal";
import { useReviews } from "../shared/review-hooks/useReviews";
import type { Review } from "../shared/review-types";

const DoctorsReviews = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const {
    filteredReviews,
    loading,
    error,
    applyFilters,
    applySort,
  } = useReviews();

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleExport = (format: "pdf" | "excel") => {
    // TODO: Implement export functionality
    console.log(`Exporting reviews as ${format}`);
  };

  const handleView = (review: Review) => {
    setSelectedReview(review);
  };

  const handleCloseModal = () => {
    setSelectedReview(null);
  };

  return (
    <>
      {/* ========================
			Start Page Content
		========================= */}
      <div className="page-wrapper">
        {/* Start Content */}
        <div className="content">
          {/* Page Header */}
          <ReviewsHeader onExportClick={handleExport} />
          {/* End Page Header */}
          {/* Filters */}
          <ReviewsFilters
            searchText={searchText}
            onSearchChange={handleSearch}
            onFilterChange={applyFilters}
            onSortChange={applySort}
          />
          {/* End Filters */}
          {/* Loading State */}
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
          {/* Error State */}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          {/* Table */}
          {!loading && (
            <ReviewsTable
              data={filteredReviews}
              searchText={searchText}
              onView={handleView}
            />
          )}
          {/* End Table */}
        </div>
        {/* End Content */}
        {/* Footer Start */}
        <div className="footer text-center bg-white p-2 border-top">
          <p className="text-dark mb-0">
            2025 ©
            <Link to="#" className="link-primary">
              Doctoury
            </Link>
            , All Rights Reserved
          </p>
        </div>
        {/* Footer End */}
      </div>
      {/* ========================
			End Page Content
		========================= */}
      {/* Review Details Modal */}
      <ReviewDetailsModal
        review={selectedReview}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default DoctorsReviews;
