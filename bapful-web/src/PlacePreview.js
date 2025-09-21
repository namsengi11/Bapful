import React from 'react';
import './PlacePreview.css';

export default function PlacePreview({ place, onShowAllReviews, onPlaceClick }) {
  const handlePlaceClick = () => {
    if (onPlaceClick) {
      onPlaceClick(place);
    }
  };

  const handleShowAllReviews = () => {
    if (onShowAllReviews) {
      onShowAllReviews();
    }
  };

  return (
    <div className="place-preview-container" onClick={handlePlaceClick}>
      {/* Title Section */}
      <div className="place-title-container">
        <img
          src="/assets/foods/tbk.png"
          alt="Place Rank"
          className="place-rank-image"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div className="place-title-content">
          <h3 className="place-title-text">{place.name}</h3>
        </div>
        <img
          src="/assets/spoon_rating.png"
          alt="Rating"
          className="place-rating-image"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <span className="place-rating-text">
          {place.rating ? place.rating.toFixed(1) : "No Review"}
        </span>
        <span className="place-rating-count">
          {place.ratingCount ? `(${place.ratingCount})` : ""}
        </span>
      </div>

      {/* Description Section */}
      <div className="place-description-container">
        <p className="place-description-text">
          {place.description || place.address || "No description available"}
        </p>
      </div>

      {/* Image Slider Placeholder */}
      <div className="place-image-slider-container">
        <div className="image-placeholder">
          <span>Image Gallery</span>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="place-review-container">
        {place.reviews && place.reviews.length > 0 && (
          <>
            {/* First Review */}
            <div className="user-review-container">
              <span className="review-user">{place.reviews[0].user}</span>
              <img
                src="/assets/spoon_rating.png"
                alt="User Rating"
                className="user-rating-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span className="review-rating">{place.reviews[0].rating}</span>
              <span className="review-comment">{place.reviews[0].comment}</span>
            </div>

            {/* Second Review */}
            {place.reviews.length > 1 && (
              <div className="user-review-container">
                <span className="review-user">{place.reviews[1].user}</span>
                <img
                  src="/assets/spoon_rating.png"
                  alt="User Rating"
                  className="user-rating-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <span className="review-rating">{place.reviews[1].rating}</span>
                <span className="review-comment">{place.reviews[1].comment}</span>
              </div>
            )}

            {/* Show All Reviews Button */}
            <button
              className="show-all-reviews-button"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering place click
                handleShowAllReviews();
              }}
            >
              <span className="show-all-reviews-text">
                리뷰 {place.reviews.length}개 모두 보기 &gt;
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
