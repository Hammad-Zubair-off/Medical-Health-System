interface StarRatingProps {
  rating: number;
  maxRating?: number;
  showNumber?: boolean;
}

const StarRating = ({
  rating,
  maxRating = 5,
  showNumber = false,
}: StarRatingProps) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="d-flex align-items-center">
      <div className="d-flex">
        {[...Array(fullStars)].map((_, i) => (
          <i key={`full-${i}`} className="ti ti-star-filled text-warning" />
        ))}
        {hasHalfStar && (
          <i className="ti ti-star-half-filled text-warning" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <i key={`empty-${i}`} className="ti ti-star text-muted" />
        ))}
      </div>
      {showNumber && (
        <span className="ms-2 fw-medium">{rating.toFixed(1)}</span>
      )}
    </div>
  );
};

export default StarRating;

