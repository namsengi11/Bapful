import React, { useEffect, useRef, useState } from 'react';
import './BapfulMap.css';

const { kakao } = window;

const BapfulMap = ({
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

        // Add markers for places
        const markers = {}
        const infoWindows = {}
        console.log(places[0])
        const marker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(places[0].latitude, places[0].longitude)
        });
        marker.setMap(map);
        markersRef.current.push(marker);

        // places.forEach((place, index) => {
        //   markers['marker' + index] = new window.kakao.maps.Marker({
        //     position: new window.kakao.maps.LatLng(place.latitude, place.longitude)
        //   });
        //   markers['marker' + index].setMap(map);
        //   markersRef.current.push(markers['marker' + index]);

        //   // Create info window
        //   infoWindows['infoWindow' + index] = new window.kakao.maps.InfoWindow({
        //     content: `<div style="padding:5px; font-size:12px;">${place.name}</div>`
        //   });

        //   // Add click event
        //   window.kakao.maps.event.addListener(markers['marker' + index], 'click', function() {
        //     infoWindows['infoWindow' + index].open(map, markers['marker' + index]);
        //     if (onPlaceClick) {
        //       onPlaceClick(place);
        //     }
        //   });
        // });
        console.log(places)
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
};

export default BapfulMap;
