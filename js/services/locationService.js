/* TRAVORA BD - Location, Geolocation & Distance Calculation Service */

(function () {
  const DEFAULT_USER_LOCATION = {
    name: 'Dhaka City Center (Gulshan 2)',
    lat: 23.7925,
    lng: 90.4078
  };

  window.LocationService = {
    // Get current stored or fallback location
    getUserLocation() {
      const saved = localStorage.getItem('travora_selected_location');
      return saved ? JSON.parse(saved) : DEFAULT_USER_LOCATION;
    },

    // Set user location manually
    setUserLocation(loc) {
      localStorage.setItem('travora_selected_location', JSON.stringify(loc));
    },

    // Haversine Distance Formula (Returns distance string in meters or kilometers)
    calculateDistance(lat1, lon1, lat2, lon2) {
      const R = 6371; // Radius of Earth in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distanceKm = R * c;

      if (distanceKm < 1) {
        const meters = Math.round(distanceKm * 1000);
        return `${meters} meters`;
      }
      return `${distanceKm.toFixed(1)} km`;
    },

    // Estimated travel time calculation by car/bus (assuming 45 km/h avg speed)
    getEstimatedTravelTime(distanceKmNumber) {
      const hours = distanceKmNumber / 45;
      if (hours < 1) {
        return `${Math.round(hours * 60)} mins`;
      }
      const h = Math.floor(hours);
      const m = Math.round((hours - h) * 60);
      return `${h}h ${m}m`;
    }
  };
})();
