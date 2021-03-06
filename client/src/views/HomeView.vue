<template>
  <div class="h-screen relative">
     <GeoErrorModal @closeGeoError="closeGeoError" 
     v-if="geoError" 
     :geoErrorMsg="geoErrorMsg" />

     <MapFeatures 
      @getGeolocation="getGeolocation"
      @plotResult="plotResult"
      @toggleSearchResults="toggleSearchResults"
      @removeResult="removeResult"
      :coords="coords" 
      :fetchCoords="fetchCoords"
      :searchResults="searchResults" />

     <div id="map" class="h-full z-[1]"></div>
  </div>
</template>

<script>
import leaflet from "leaflet";
import { onMounted, ref } from "vue";
import GeoErrorModal from "@/components/GeoErrorModal.vue";
import MapFeatures from "@/components/MapFeatures.vue";
export default {
  name: "HomeView",
  components: { GeoErrorModal, MapFeatures },
  setup() {
      let map;
      onMounted(() => {
        // init map
        map = leaflet.map('map').setView([28.538336, -81.379234], 10);

        // add tile layer
        leaflet
          .tileLayer(
            `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${process.env.VUE_APP_API_KEY}`, 
            {
              attribution: 
                'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
              maxZoom: 18,
              id: 'mapbox/streets-v11',
              tileSize: 512,
              zoomOffset: -1,
              accessToken: process.env.VUE_APP_API_KEY,
            }
          )
          .addTo(map);

        map.on("moveend", () => {
          closeSearchResults();
        });

        getGeolocation();
      });
  
      const coords = ref(null);
      const fetchCoords = ref(true);
      const geoMarket = ref(null);
      const geoError = ref(true);
      const geoErrorMsg = ref(null);

      const getGeolocation = () => {
        if (coords.value) {
          coords.value = null;
          sessionStorage.removeItem("coords");
          map.removeLayer(geoMarket.value);
          return;
        }
        // check session storage for coords
        if (sessionStorage.getitem("coords")) {
          coords.value = JSON.parse(sessionStorage.getItem("coords"));
          plotGeolocation(coords.value);
          return;
        }

        fetchCoords.value = true;
        navigator.geolocation.getCurrentPosition(setCoords, getLocError);
        return;
      };

      const setCoords = (pos) => {
        // stop fetching coords
        fetchCoords.value = null;

        // set coords in session storage
        const setSessionCoords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        sessionStorage.setItem("coords", JSON.stringify(setSessionCoords));

        // set ref coords value
        coords.value = setSessionCoords;

        plotGeolocation(coords.value);
      };

      const getLocError = (error) => {
        fetchCoords.value = null;
        geoError.value = true;
        geoErrorMsg.value = error.message;
      };

      const plotGeolocation = (coords) => {
        // create custom market
        const customMarket = leaflet.icon({
          iconUrl: require("../assets/map-marker-red.svg"),
          iconSize: [35, 35],
        });

        // create new market with coords and custom icon
        geoMarket.value = leaflet
        .market([coords.lat, coords.lng], { icon: customMarket })
        .addTo(map);

        // set map view to current location
        map.setView([coords.lat, coords.lng], 10);
      };

      const closeGeoError = () => {
        geoError.value = null;
        geoErrorMsg.value = null;
      }

      const resultMarker = ref(null);
      const plotResult = (coords) => {
        // check to see if resultmrker has value
        if (resultMarker.value) {
          map.removeLayer(resultMarker.value);
        }

            // create custom market
        const customMarket = leaflet.icon({
          iconUrl: require("../assets/map-marker-blue.svg"),
          iconSize: [35, 35],
        });

        // create new market with coords and custom icon
        resultMarker.value = leaflet
        .market([coords.coordinates[1], coords.coordinates[0]], { icon: customMarket })
        .addto(map);

        // set map view to current location
        map.setView([coords.coordinates[1], coords.coordinates[0]], 14);
      
        closeSearchResults();
      };

      const searchResults =ref(null);
      const toggleSearchResults = () => {
        searchResults.value = !searchResults.value;
      };

      const closeSearchResults = () => {
        searchResults.value = null;
      };

      const removeResult = () => {
        map.removeLayer(resultMarker.value);
      };

      return { 
        coords, 
        fetchCoords, 
        geoMarket, 
        closeGeoError, 
        geoError, 
        geoErrorMsg, 
        getGeolocation, 
        plotResult, 
        searchResults, 
        toggleSearchResults, 
        closeSearchResults,
        removeResult,
      };
  },
};
</script>
