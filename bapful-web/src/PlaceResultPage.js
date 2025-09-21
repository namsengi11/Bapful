import React, { useState, useEffect } from 'react';
import PlacePreview from './PlacePreview';
import { searchLocations } from './services/api';
import './PlaceResultPage.css';

export default function PlaceResultPage({
  searchKeyword,
  currentLocation,
  onPlaceClick
}) {
  const [searchedPlaces, setSearchedPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle too long searchKeyword with ...
  const truncatedSearchKeyword = searchKeyword && searchKeyword.length > 10
    ? searchKeyword.slice(0, 10) + "..."
    : searchKeyword;

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchKeyword || !searchKeyword.trim()) {
        setSearchedPlaces([]);
        return;
      }

      if (!currentLocation) {
        setError('Location not available for search');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('Searching for:', searchKeyword, 'at location:', currentLocation);

        const results = await searchLocations(
          searchKeyword.trim(),
          currentLocation.latitude,
          currentLocation.longitude
        );

        console.log('Search results:', results);

        // Transform API response to match our Place structure
        const transformedPlaces = results.map((place, index) => ({
          id: place.location_id || place.id || index,
          name: place.name || 'Unknown Place',
          address: place.address || '',
          description: place.description || place.address || '',
          latitude: place.coordinates?.lat || 0,
          longitude: place.coordinates?.lng || 0,
          rating: place.avg_rating || 0,
          ratingCount: place.review_count || 0,
          type: place.location_type || 'Restaurant',
          reviews: [], // API doesn't return detailed reviews in search
        }));

        setSearchedPlaces(transformedPlaces);
      } catch (error) {
        console.error('Search error:', error);
        setError('Failed to search places. Please try again.');
        setSearchedPlaces([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchKeyword, currentLocation]);

  return (
    <div className="place-result-container">
      <div className="search-keyword-container">
        <h2 className="search-keyword-text">
          {truncatedSearchKeyword} Recommendations
        </h2>
      </div>
      <div className="place-list-container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Searching for places...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : searchedPlaces && searchedPlaces.length > 0 ? (
          <div className="place-list">
            {searchedPlaces.map((place, index) => (
              <div key={place.id || index}>
                <PlacePreview
                  place={place}
                  onPlaceClick={onPlaceClick}
                  onShowAllReviews={() => console.log('Show all reviews for', place.name)}
                />
                {index < searchedPlaces.length - 1 && <div className="place-separator" />}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>No places found for "{searchKeyword}"</p>
            <p className="no-results-subtitle">Try searching for a different term or location</p>
          </div>
        )}
      </div>
    </div>
  );
}
