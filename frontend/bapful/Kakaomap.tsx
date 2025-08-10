import React, { useEffect } from "react";
import { View, StyleSheet, Text, SafeAreaView, Dimensions } from "react-native";
import { WebView } from "react-native-webview";
import { Place } from "./Place";

type KakaoMapProps = {
  latitude: number;
  longitude: number;
  places: Place[];
  onPlaceClick: (place: Place) => void;
};

export default function KakaoMap({
  latitude,
  longitude,
  places,
  onPlaceClick,
}: KakaoMapProps) {
  const map_js_api_key = process.env.EXPO_PUBLIC_JS_API_KEY;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${map_js_api_key}&libraries=services,drawing"></script>
        <style>
          body { margin: 0; padding: 0; height: 100%; }
          html { height: 100%; }
          #map { width: ${Dimensions.get("window").width}px; height: ${
    Dimensions.get("window").height
  }px; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          window.onload = function() {
            if (typeof kakao !== 'undefined' && kakao.maps) {
              const mapContainer = document.getElementById('map');
              const mapOption = {
                center: new kakao.maps.LatLng(${latitude}, ${longitude}),
                level: 3
              };
              const map = new kakao.maps.Map(mapContainer, mapOption);

              ${places
                .map(
                  (place, index) => `
              const marker${index} = new kakao.maps.Marker({
                position: new kakao.maps.LatLng(${place.latitude}, ${place.longitude})
              });
              marker${index}.setMap(map);

              const infoWindow${index} = new kakao.maps.InfoWindow({
                content: '<div style="padding:5px;">${place.name}</div>'
              });

              kakao.maps.event.addListener(marker${index}, 'click', function() {
                infoWindow${index}.open(map, marker${index});
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'PLACE_CLICK',
                  place: ${JSON.stringify(place)}
                }));
              });
              `
                )
                .join("\n")}
            } else {
              console.error('Kakao Maps is not available');
            }
          };
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onLoad={() => console.log("WebView loaded successfully")}
        onError={(e: any) => console.error("WebView error: ", e.nativeEvent)}
        onHTTPError={(e: any) => console.error("HTTP error: ", e.nativeEvent)}
        injectedJavaScript={`(function() {
          window.console.log = function(message) {
            window.ReactNativeWebView.postMessage(message);
          }
        })();`}
        onMessage={(event) => {
          try {
            const message = JSON.parse(event.nativeEvent.data);
            if (message.type === "PLACE_CLICK" && message.place) {
              onPlaceClick(message.place);
            }
          } catch (error) {
            // Handle non-JSON messages  (like console.log messages)
            console.log(event.nativeEvent.data);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  webview: {
    flex: 1,
  },
});
