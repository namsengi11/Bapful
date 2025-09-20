import React, { useEffect, useState } from 'react';
import BapfulMap from './BapfulMap';
import './Home.css';

// Place class definition (converted from React Native)
class Place {
  constructor(id, name, address, latitude, longitude, category, rating, reviews) {
    this.id = id;
    this.name = name;
    this.address = address;
    this.latitude = latitude;
    this.longitude = longitude;
    this.category = category;
    this.rating = rating;
    this.reviews = reviews;
  }

  static fromAPIResponse(data) {
    return new Place(
      data.id,
      data.name,
      data.address,
      data.latitude,
      data.longitude,
      data.category,
      data.rating,
      data.reviews
    );
  }
}

export default function Home() {
  const [currentLocation, setCurrentLocation] = useState({ latitude: 37.593371, longitude: 127.01673 });
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showPlaceDetail, setShowPlaceDetail] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchedPlaces, setSearchedPlaces] = useState([]);
  const [showPlaceResultPage, setShowPlaceResultPage] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (currentLocation) {
      getNearbyTourism();
    }
  }, [currentLocation]);

  useEffect(() => {
    if (searchedPlaces.length > 0 || searchKeyword) {
      setShowPlaceResultPage(true);
    }
  }, [searchedPlaces, searchKeyword]);

  const toggleUserProfile = () => {
    setShowUserProfile(!showUserProfile);
  };

  const getCurrentLocation = async () => {
    setLocationLoading(true);

    // Web Geolocation API (instead of Expo Location)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // setCurrentLocation({
          //   latitude: position.coords.latitude,
          //   longitude: position.coords.longitude,
          // });
          setLocationLoading(false);
          console.log(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('위치 정보를 가져오는 데 실패했습니다:', error);
          // Fallback to default location (same as React Native version)
          setCurrentLocation({ latitude: 37.593371, longitude: 127.01673 });
          setLocationLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000,
        }
      );
    } else {
      console.log('Geolocation is not supported by this browser.');
      // Fallback to default location
      setCurrentLocation({ latitude: 37.593371, longitude: 127.01673 });
      setLocationLoading(false);
    }
  };

  const getNearbyTourism = async () => {
    try {
      const response = await fetch(
        `http://bapful.sjnam.site/api/locations?lat=${currentLocation?.latitude}&lng=${currentLocation?.longitude}&radius=2000`
      );
      const data = await response.json();

      const places = data.map((place) => Place.fromAPIResponse(place));
      setPlaces(places);
    } catch (error) {
      console.error('Failed to fetch nearby places:', error);
    }
  };

  const handlePlaceClick = (place) => {
    setSelectedPlace(place);
    setShowPlaceDetail(true);
  };

  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    // Implement search logic here
    // For now, just filtering existing places
    const filtered = places.filter(place =>
      place.name.toLowerCase().includes(keyword.toLowerCase())
    );
    setSearchedPlaces(filtered);
  };

  return (
    <div className="home-container">
      {/* Top Banner */}
      <div className="top-banner">
        <div className="top-banner-content">
          <h1>Bapful</h1>
          <button
            className="profile-button"
            onClick={toggleUserProfile}
          >
            Profile
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Search places..."
          value={searchKeyword}
          onChange={(e) => handleSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Map Container */}
      <div className="map-container">
        {currentLocation && !locationLoading ? (
          <BapfulMap
            currentLocation={currentLocation}
            places={places}
            onPlaceClick={handlePlaceClick}
          />
        ) : (
          <div className="loading-container">
            <p>위치를 가져오는 중입니다...</p>
          </div>
        )}
      </div>

      {/* User Profile Overlay */}
      {showUserProfile && (
        <div className="user-profile-overlay">
          <div className="user-profile-content">
            <div className="user-profile-header">
              <h2>User Profile</h2>
              <button
                className="close-button"
                onClick={() => setShowUserProfile(false)}
              >
                ×
              </button>
            </div>
            <div className="user-profile-body">
              <p>User profile content goes here...</p>
            </div>
          </div>
        </div>
      )}

      {/* Place Detail Modal */}
      {showPlaceDetail && selectedPlace && (
        <div className="modal-overlay" onClick={() => setShowPlaceDetail(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedPlace.name}</h3>
              <button
                className="close-button"
                onClick={() => setShowPlaceDetail(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p><strong>Address:</strong> {selectedPlace.address}</p>
              <p><strong>Category:</strong> {selectedPlace.category}</p>
              {selectedPlace.rating && (
                <p><strong>Rating:</strong> {selectedPlace.rating}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search Results Modal */}
      {showPlaceResultPage && (
        <div className="modal-overlay" onClick={() => setShowPlaceResultPage(false)}>
          <div className="modal-content search-results" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Search Results for "{searchKeyword}"</h3>
              <button
                className="close-button"
                onClick={() => setShowPlaceResultPage(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {searchedPlaces.length > 0 ? (
                <div className="search-results-list">
                  {searchedPlaces.map((place) => (
                    <div
                      key={place.id}
                      className="search-result-item"
                      onClick={() => {
                        setSelectedPlace(place);
                        setShowPlaceResultPage(false);
                        setShowPlaceDetail(true);
                      }}
                    >
                      <h4>{place.name}</h4>
                      <p>{place.address}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No results found for "{searchKeyword}"</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
