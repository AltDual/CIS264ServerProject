// Configuration
const CONFIG = {
  apiUrl: 'https://www.samtrans.com/files/rt/vehiclepositions/SM.json',
  corsProxy: 'https://corsproxy.io/?',
  refreshInterval: 10000,
  map: {
    centerLat: 37.55,
    centerLng: -122.31,
    defaultZoom: 11
  },
  routeColors: {
    '250': '#0066cc',
    '130': '#ff6633',
    '121': '#00cc66',
    '120': '#9933ff',
    '110': '#ffcc00',
    '117': '#ff0066',
    '122': '#00ccff',
    '112': '#cc6600',
    '141': '#33cc00',
    '138': '#cc00cc',
    '290': '#666666',
    'default': '#555555'
  }
};

// Global state
let map;
let busMarkers = {};
let selectedRoute = 'all';
let vehicles = [];
let refreshTimer;
let routes = new Set();

// Initialize map
function initMap() {
  map = L.map('map').setView(
    [CONFIG.map.centerLat, CONFIG.map.centerLng],
    CONFIG.map.defaultZoom
  );

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map);
}

// Create custom bus icon
function createBusIcon(routeId, vehicleLabel, bearing) {
  const color = CONFIG.routeColors[routeId] || CONFIG.routeColors.default;
  
  const iconHtml = `
    <div class="bus-marker" style="background-color: ${color}; transform: rotate(${bearing || 0}deg);">
      <span style="transform: rotate(-${bearing || 0}deg);">${vehicleLabel || '?'}</span>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
}

// Create popup content for bus
function createPopupContent(vehicle) {
  const speedMph = vehicle.position?.speed ? (vehicle.position.speed * 2.237).toFixed(1) : 'N/A';
  const bearing = vehicle.position?.bearing || 'N/A';
  const timestamp = vehicle.timestamp ? new Date(vehicle.timestamp * 1000).toLocaleString() : 'N/A';
  
  return `
    <div class="bus-popup">
      <div class="bus-popup-header">Bus ${vehicle.vehicle?.label || vehicle.vehicle?.id || 'Unknown'}</div>
      <div class="bus-popup-details">
        <div class="bus-popup-row">
          <span class="bus-popup-label">Route:</span>
          <span class="bus-popup-value">${vehicle.trip?.routeId || 'N/A'}</span>
        </div>
        <div class="bus-popup-row">
          <span class="bus-popup-label">Vehicle ID:</span>
          <span class="bus-popup-value">${vehicle.vehicle?.id || 'N/A'}</span>
        </div>
        <div class="bus-popup-row">
          <span class="bus-popup-label">Speed:</span>
          <span class="bus-popup-value">${speedMph} mph</span>
        </div>
        <div class="bus-popup-row">
          <span class="bus-popup-label">Bearing:</span>
          <span class="bus-popup-value">${bearing}°</span>
        </div>
        <div class="bus-popup-row">
          <span class="bus-popup-label">Trip ID:</span>
          <span class="bus-popup-value">${vehicle.trip?.tripId || 'N/A'}</span>
        </div>
        <div class="bus-popup-row">
          <span class="bus-popup-label">Stop ID:</span>
          <span class="bus-popup-value">${vehicle.stopId || vehicle.currentStopSequence || 'N/A'}</span>
        </div>
        <div class="bus-popup-row">
          <span class="bus-popup-label">Updated:</span>
          <span class="bus-popup-value">${timestamp}</span>
        </div>
      </div>
    </div>
  `;
}

// Update bus markers on map
function updateBusMarkers() {
  const newMarkers = {};
  const filteredVehicles = selectedRoute === 'all' 
    ? vehicles 
    : vehicles.filter(v => v.trip?.routeId === selectedRoute);

  filteredVehicles.forEach(vehicle => {
    if (!vehicle.position?.latitude || !vehicle.position?.longitude) return;

    const vehicleId = vehicle.vehicle?.id || vehicle.id;
    const routeId = vehicle.trip?.routeId || 'unknown';
    const label = vehicle.vehicle?.label || vehicleId;
    const bearing = vehicle.position?.bearing || 0;
    const lat = vehicle.position.latitude;
    const lng = vehicle.position.longitude;

    if (busMarkers[vehicleId]) {
      // Update existing marker
      const marker = busMarkers[vehicleId];
      marker.setLatLng([lat, lng]);
      marker.setIcon(createBusIcon(routeId, label, bearing));
      marker.setPopupContent(createPopupContent(vehicle));
      newMarkers[vehicleId] = marker;
    } else {
      // Create new marker
      const marker = L.marker([lat, lng], {
        icon: createBusIcon(routeId, label, bearing)
      }).addTo(map);
      
      marker.bindPopup(createPopupContent(vehicle));
      newMarkers[vehicleId] = marker;
    }
  });

  // Remove old markers
  Object.keys(busMarkers).forEach(vehicleId => {
    if (!newMarkers[vehicleId]) {
      map.removeLayer(busMarkers[vehicleId]);
    }
  });

  busMarkers = newMarkers;
}

// Update statistics
function updateStats() {
  const totalBuses = vehicles.length;
  const activeRoutes = routes.size;

  document.getElementById('totalBuses').textContent = totalBuses;
  document.getElementById('activeRoutes').textContent = activeRoutes;
}

// Update legend
function updateLegend() {
  const legendItems = document.getElementById('legendItems');
  legendItems.innerHTML = '';

  const sortedRoutes = Array.from(routes).sort((a, b) => {
    const aNum = parseInt(a);
    const bNum = parseInt(b);
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
    return a.localeCompare(b);
  });

  sortedRoutes.forEach(route => {
    const color = CONFIG.routeColors[route] || CONFIG.routeColors.default;
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `
      <div class="legend-color" style="background-color: ${color};"></div>
      <div class="legend-label">Route ${route}</div>
    `;
    legendItems.appendChild(item);
  });
}

// Update route filter dropdown
function updateRouteFilter() {
  const select = document.getElementById('routeFilter');
  const currentValue = select.value;
  
  select.innerHTML = '<option value="all">All Routes</option>';
  
  const sortedRoutes = Array.from(routes).sort((a, b) => {
    const aNum = parseInt(a);
    const bNum = parseInt(b);
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
    return a.localeCompare(b);
  });

  sortedRoutes.forEach(route => {
    const option = document.createElement('option');
    option.value = route;
    option.textContent = `Route ${route}`;
    select.appendChild(option);
  });

  select.value = currentValue;
}

// Fetch vehicle data
async function fetchVehicleData() {
  const loadingIndicator = document.getElementById('loadingIndicator');
  const errorMessage = document.getElementById('errorMessage');
  
  try {
    loadingIndicator.classList.add('active');
    errorMessage.style.display = 'none';

    // Try direct API call first
    let response;
    try {
      response = await fetch(CONFIG.apiUrl);
      if (!response.ok) throw new Error('Direct fetch failed');
    } catch (directError) {
      // Fallback to CORS proxy
      response = await fetch(CONFIG.corsProxy + encodeURIComponent(CONFIG.apiUrl));
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Parse GTFS Realtime data
    if (data.entity) {
      vehicles = data.entity
        .filter(entity => entity.vehicle && entity.vehicle.position)
        .map(entity => ({
          id: entity.id,
          vehicle: entity.vehicle.vehicle,
          trip: entity.vehicle.trip,
          position: entity.vehicle.position,
          timestamp: entity.vehicle.timestamp,
          stopId: entity.vehicle.stopId,
          currentStopSequence: entity.vehicle.currentStopSequence,
          currentStatus: entity.vehicle.currentStatus
        }));

      // Extract unique routes
      routes.clear();
      vehicles.forEach(vehicle => {
        if (vehicle.trip?.routeId) {
          routes.add(vehicle.trip.routeId);
        }
      });

      updateBusMarkers();
      updateStats();
      updateLegend();
      updateRouteFilter();
      
      const now = new Date().toLocaleTimeString();
      document.getElementById('lastUpdate').textContent = `Last update: ${now}`;
    } else {
      throw new Error('Invalid data format');
    }

  } catch (error) {
    console.error('Error fetching vehicle data:', error);
    errorMessage.textContent = `Error loading bus data: ${error.message}. Retrying...`;
    errorMessage.style.display = 'block';
    
    setTimeout(() => {
      errorMessage.style.display = 'none';
    }, 5000);
  } finally {
    loadingIndicator.classList.remove('active');
  }
}

// Refresh data manually
function refreshData() {
  fetchVehicleData();
}

// Setup auto-refresh
function setupAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }
  refreshTimer = setInterval(fetchVehicleData, CONFIG.refreshInterval);
}

// Toggle sidebar for mobile
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('active');
}

// Event listeners
function setupEventListeners() {
  document.getElementById('routeFilter').addEventListener('change', (e) => {
    selectedRoute = e.target.value;
    updateBusMarkers();
  });

  // Close sidebar when clicking on map on mobile
  map.on('click', () => {
    if (window.innerWidth <= 768) {
      const sidebar = document.getElementById('sidebar');
      sidebar.classList.remove('active');
    }
  });
}

// Initialize application
function init() {
  initMap();
  setupEventListeners();
  fetchVehicleData();
  setupAutoRefresh();
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}