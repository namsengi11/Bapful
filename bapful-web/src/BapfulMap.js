import React, { useEffect, useRef, useState, memo } from 'react';
import './BapfulMap.css';

const { kakao } = window;

const BapfulMap = memo(({
  currentLocation,
  places = [],
  onPlaceClick
}) => {
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const [kakaomapScriptLoaded, setKakaomapScriptLoaded] = useState(false);

  // Get API key from environment
  const apiKey = process.env.REACT_APP_JS_API_KEY;

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services,drawing&autoload=false`;
    script.id = "kakao-map-script";
    script.async = true;

    script.onload = () => {
      console.log("Script loaded, waiting for Kakao Maps API...");
      setKakaomapScriptLoaded(true);
      // Wait for kakao object to be available and then load maps
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load();
      }
    };

    script.onerror = () => {
      console.error('Failed to load Kakao Maps script');
    };

    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    const renderMap = () => {
      // Do not render map if script not loaded or no current location
      if (!kakaomapScriptLoaded || !currentLocation) return;

      const mapContainer = document.getElementById("bapful-map");
      if (!mapContainer) {
        console.error('Map container not found');
        return;
      }

      function setCenter(map, lat, lng) {
        var moveLatLon = new window.kakao.maps.LatLng(lat, lng);
        map.setCenter(moveLatLon);
      }

      try {
        const mapOption = {
          center: new window.kakao.maps.LatLng(currentLocation.latitude, currentLocation.longitude),
          level: 3
        };

        const map = new window.kakao.maps.Map(mapContainer, mapOption);
        mapInstanceRef.current = map;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        // Map of corresponding pin image for place type
        const placeTypeImageMap = {
          '음식점': 'http://bapful.sjnam.site/static/restaurant.png',
          '카페': 'http://bapful.sjnam.site/static/cafe.png',
          '문화시설': 'http://bapful.sjnam.site/static/tourist_destination.png',
          '쇼핑': 'http://bapful.sjnam.site/static/tourist_destination.png',
          '관광지': 'http://bapful.sjnam.site/static/tourist_destination.png',
        };

        // Add markers for places
        if (places == null || places.length == 0) return;

        const markers = {}
        const infoWindows = {}

        places.forEach((place, index) => {
          var imageSrc = placeTypeImageMap[place.type] || 'http://bapful.sjnam.site/static/restaurant.png'
          var imageSize = new window.kakao.maps.Size(85, 85);
          var markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize);

          markers['marker' + index] = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(place.latitude, place.longitude),
            image: markerImage
          });
          markers['marker' + index].setMap(map);
          markersRef.current.push(markers['marker' + index]);

          // Create info window
          infoWindows['infoWindow' + index] = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:5px; font-size:12px;">${place.name}</div>`
          });

          // Add click event
          window.kakao.maps.event.addListener(markers['marker' + index], 'click', function() {
            infoWindows['infoWindow' + index].open(map, markers['marker' + index]);
            if (onPlaceClick) {
              onPlaceClick(place);
            }
            // Set map center to the clicked place
            setCenter(map, place.latitude, place.longitude);
          });
        });
        console.log('Map rendered successfully');
      } catch (error) {
        console.error('Error rendering map:', error);
      }
    };

    if (kakaomapScriptLoaded && currentLocation) {
      renderMap();
    }
  }, [currentLocation, places, kakaomapScriptLoaded, onPlaceClick]);

  return (
    <div className="bapful-map-container">
      {!kakaomapScriptLoaded && (
        <div className="loading-message" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
          fontSize: '16px',
          color: '#666'
        }}>
          Loading Kakao Maps...
        </div>
      )}
      <div
        id="bapful-map"
        className="bapful-map"
        style={{
          width: '100%',
          height: '100%',
          minHeight: '400px',
          display: kakaomapScriptLoaded ? 'block' : 'none'
        }}
      />
    </div>
  );
});

export default BapfulMap;
