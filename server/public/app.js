// Configuration
const CONFIG = {
  apiUrl: 'https://www.samtrans.com/files/rt/vehiclepositions/SM.json',
  corsProxy: 'https://corsproxy.io/?',
  refreshInterval: 60000,
  map: {
    centerLat: 37.55,
    centerLng: -122.31,
    defaultZoom: 11
  },
  routeColors: {
    '250': '#0066cc',
   
    'default': '#555555'
  }
};


// Route 250 Coordinates (test with first 6 points)
const ROUTE_250_COORDS = [[[-122.33712,37.53373],[-122.33757,37.53406],[-122.33772,37.53418],[-122.33821,37.5338],[-122.33863,37.5334],[-122.33876,37.53326],[-122.33887,37.5331],[-122.3389,37.533],[-122.33888,37.53291],[-122.3388,37.53278],[-122.33846,37.5325],[-122.3384,37.53245],[-122.33788,37.53204],[-122.33768,37.53191],[-122.33751,37.53179],[-122.33738,37.53172],[-122.33729,37.53168],[-122.33711,37.53161],[-122.33695,37.53159],[-122.33677,37.53157],[-122.33658,37.53158],[-122.33632,37.53162],[-122.33611,37.53167],[-122.33596,37.53172],[-122.33586,37.53171],[-122.33584,37.53171],[-122.33571,37.53173],[-122.33563,37.53173],[-122.33547,37.53172],[-122.33516,37.5317],[-122.33499,37.53166],[-122.33474,37.53161],[-122.33453,37.53158],[-122.33434,37.53155],[-122.33428,37.53154],[-122.33395,37.53153],[-122.33381,37.53153],[-122.33353,37.53153],[-122.33338,37.53153],[-122.33323,37.53155],[-122.33308,37.53156],[-122.3329,37.5316],[-122.33256,37.53167],[-122.33256,37.53167],[-122.33256,37.53167],[-122.33249,37.53169],[-122.33237,37.53172],[-122.3322,37.53179],[-122.33202,37.53187],[-122.33176,37.53199],[-122.33162,37.53206],[-122.33136,37.53218],[-122.33121,37.53225],[-122.33111,37.53229],[-122.33102,37.53232],[-122.33093,37.53235],[-122.33064,37.53242],[-122.33007,37.53251],[-122.32979,37.53256],[-122.32961,37.53259],[-122.32952,37.53261],[-122.3291,37.53269],[-122.32903,37.53271],[-122.32869,37.53278],[-122.32834,37.53283],[-122.32814,37.53286],[-122.3276,37.5329],[-122.32704,37.53296],[-122.32698,37.533],[-122.32678,37.53301],[-122.32678,37.53301],[-122.32659,37.53302],[-122.32572,37.53307],[-122.32563,37.53307],[-122.32547,37.53306],[-122.32537,37.53305],[-122.3253,37.53304],[-122.32515,37.533],[-122.32484,37.53289],[-122.32468,37.53281],[-122.32444,37.53266],[-122.32399,37.53244],[-122.32377,37.53231],[-122.32325,37.53199],[-122.32299,37.53177],[-122.32292,37.53168],[-122.32282,37.53147],[-122.3227,37.53113],[-122.32249,37.53064],[-122.32238,37.53044],[-122.32224,37.53023],[-122.32179,37.52977],[-122.32179,37.52977],[-122.32174,37.52973],[-122.32162,37.52963],[-122.32151,37.52952],[-122.32129,37.52935],[-122.32112,37.52927],[-122.32093,37.52919],[-122.32067,37.52913],[-122.32042,37.52911],[-122.32005,37.5291],[-122.31936,37.52918],[-122.31911,37.52926],[-122.3188,37.52939],[-122.31807,37.52986],[-122.31791,37.52993],[-122.31776,37.52998],[-122.31759,37.53001],[-122.31734,37.53004],[-122.317,37.52999],[-122.31658,37.52985],[-122.31628,37.52977],[-122.31591,37.52969],[-122.31583,37.52966],[-122.31552,37.52968],[-122.31485,37.52979],[-122.31422,37.52996],[-122.31408,37.53],[-122.31399,37.53002],[-122.31382,37.53003],[-122.31367,37.53003],[-122.31349,37.53],[-122.31324,37.52991],[-122.31297,37.52986],[-122.31283,37.52987],[-122.31266,37.52996],[-122.31239,37.53013],[-122.31194,37.5304],[-122.31194,37.5304],[-122.31183,37.53046],[-122.31046,37.53126],[-122.31026,37.53136],[-122.31002,37.53145],[-122.3098,37.53152],[-122.30949,37.53157],[-122.30877,37.53168],[-122.30853,37.53175],[-122.3083,37.53184],[-122.3082,37.53188],[-122.30805,37.53193],[-122.30759,37.53213],[-122.30735,37.53226],[-122.30714,37.53242],[-122.307,37.53256],[-122.30689,37.53265],[-122.30674,37.53281],[-122.30648,37.533],[-122.30625,37.53315],[-122.30573,37.53343],[-122.30547,37.53353],[-122.30514,37.53365],[-122.30495,37.53368],[-122.30454,37.53379],[-122.30419,37.53385],[-122.30419,37.53385],[-122.30417,37.53385],[-122.30353,37.53392],[-122.30269,37.53391],[-122.30247,37.53392],[-122.30216,37.53395],[-122.30191,37.53402],[-122.30165,37.5341],[-122.30141,37.53419],[-122.30119,37.53431],[-122.30076,37.53461],[-122.3005,37.53481],[-122.30035,37.53492],[-122.30023,37.53493],[-122.30019,37.53497],[-122.30012,37.53504],[-122.3001,37.53505],[-122.29977,37.53531],[-122.29977,37.53531],[-122.29937,37.53562],[-122.29853,37.53628],[-122.29815,37.53655],[-122.29777,37.53682],[-122.29767,37.5369],[-122.29754,37.53701],[-122.29743,37.53708],[-122.29733,37.53715],[-122.29738,37.53719],[-122.29742,37.53724],[-122.29747,37.53729],[-122.29761,37.53742],[-122.29814,37.53784],[-122.29814,37.53784],[-122.29908,37.5386],[-122.29957,37.53897],[-122.29962,37.53905],[-122.29965,37.53911],[-122.29968,37.53919],[-122.2997,37.53926],[-122.2997,37.53937],[-122.29959,37.53945],[-122.29958,37.53948],[-122.29888,37.53985],[-122.29825,37.54019],[-122.29799,37.54029],[-122.29776,37.54035],[-122.29776,37.54035],[-122.29763,37.54039],[-122.29716,37.54043],[-122.29703,37.54041],[-122.29628,37.54044],[-122.29561,37.54047],[-122.29552,37.54047],[-122.29515,37.54055],[-122.29501,37.5406],[-122.29485,37.54068],[-122.29485,37.54068],[-122.29465,37.54079],[-122.29465,37.54079],[-122.2935,37.54155],[-122.29255,37.54215],[-122.29241,37.5423],[-122.29235,37.54239],[-122.2923,37.54253],[-122.29229,37.54276],[-122.29229,37.54276],[-122.29228,37.54278],[-122.29226,37.54287],[-122.2922,37.54296],[-122.29207,37.54308],[-122.29184,37.5432],[-122.29175,37.54307],[-122.29156,37.54252],[-122.29147,37.54228],[-122.29138,37.54214],[-122.29127,37.542],[-122.29103,37.54178],[-122.29101,37.54175],[-122.29092,37.54167],[-122.29084,37.54179],[-122.29071,37.54201],[-122.29063,37.54213],[-122.29063,37.54213],[-122.29056,37.54225],[-122.29043,37.54246],[-122.29033,37.54262],[-122.29028,37.54269],[-122.29025,37.54272],[-122.29018,37.54281],[-122.2899,37.54313],[-122.28973,37.5433],[-122.28954,37.54347],[-122.28946,37.54354],[-122.28936,37.54361],[-122.2892,37.54373],[-122.28908,37.54381],[-122.28878,37.54399],[-122.28859,37.54411],[-122.28852,37.54415],[-122.28845,37.54419],[-122.28827,37.54429],[-122.28823,37.54432],[-122.28817,37.54434],[-122.288,37.54445],[-122.28794,37.54448],[-122.28784,37.54455],[-122.28766,37.54465],[-122.28762,37.54467],[-122.28724,37.54488],[-122.28702,37.545],[-122.28669,37.54518],[-122.2866,37.54523],[-122.28644,37.54532],[-122.28582,37.54565],[-122.28535,37.54594],[-122.28519,37.54603],[-122.28505,37.54611],[-122.28491,37.54596],[-122.28456,37.54557],[-122.28439,37.5454],[-122.28439,37.5454],[-122.28403,37.54504],[-122.28401,37.54497],[-122.28395,37.54487],[-122.28387,37.54477],[-122.28386,37.54472],[-122.28385,37.54469],[-122.28386,37.54465],[-122.28387,37.54457],[-122.2848,37.54333],[-122.2848,37.54333],[-122.28481,37.54332],[-122.28501,37.54306],[-122.28529,37.54265],[-122.28531,37.54262],[-122.28532,37.54255],[-122.28531,37.5425],[-122.28528,37.54244],[-122.2851,37.54224],[-122.28448,37.54147],[-122.2843,37.54126],[-122.28404,37.54101],[-122.28381,37.54115],[-122.28381,37.54115],[-122.28372,37.5412],[-122.2835,37.54133],[-122.28331,37.54144],[-122.28302,37.54165],[-122.28298,37.54171],[-122.28297,37.54183],[-122.28299,37.54196],[-122.28302,37.54201],[-122.28315,37.54224],[-122.28328,37.54245],[-122.28343,37.54262],[-122.28354,37.5427],[-122.28442,37.54313],[-122.28481,37.54332],[-122.28389,37.54455],[-122.28389,37.54455],[-122.28387,37.54457],[-122.28369,37.54483],[-122.28363,37.54492],[-122.2838,37.54501],[-122.28388,37.54505],[-122.28396,37.54512],[-122.28443,37.54565],[-122.2848,37.54603],[-122.28494,37.54618],[-122.28498,37.54623],[-122.28504,37.54629],[-122.2851,37.54633],[-122.28518,37.54636],[-122.28528,37.54646],[-122.28547,37.54667],[-122.2856,37.5468],[-122.2856,37.5468],[-122.28613,37.54733],[-122.28692,37.54818],[-122.28731,37.5486],[-122.28788,37.54922],[-122.28805,37.54939],[-122.28805,37.54939],[-122.28822,37.54955],[-122.28877,37.5502],[-122.28899,37.55044],[-122.28908,37.55059],[-122.28915,37.55072],[-122.28931,37.55131],[-122.28941,37.55167],[-122.2895,37.55184],[-122.28963,37.552],[-122.28989,37.55231],[-122.29016,37.5526],[-122.29048,37.55298],[-122.29058,37.55309],[-122.29076,37.55327],[-122.29076,37.55327],[-122.29106,37.55358],[-122.29127,37.55378],[-122.29131,37.55384],[-122.29137,37.55389],[-122.29142,37.55395],[-122.29156,37.55408],[-122.29162,37.55412],[-122.29164,37.55414],[-122.29173,37.55423],[-122.29193,37.55442],[-122.29205,37.55452],[-122.29245,37.55488],[-122.29296,37.55535],[-122.29314,37.55549],[-122.29336,37.55565],[-122.29354,37.55578],[-122.29354,37.55578],[-122.2937,37.55591],[-122.29376,37.55594],[-122.29391,37.55604],[-122.29445,37.55643],[-122.29459,37.55654],[-122.29471,37.55665],[-122.29515,37.55714],[-122.29549,37.5575],[-122.29581,37.55787],[-122.29595,37.55802],[-122.29595,37.55802],[-122.29636,37.55843],[-122.29716,37.55933],[-122.29834,37.56057],[-122.29898,37.5613],[-122.29919,37.56154],[-122.29945,37.5618],[-122.29948,37.56183],[-122.29948,37.56183],[-122.29982,37.56219],[-122.30022,37.56256],[-122.30049,37.5628],[-122.30077,37.56304],[-122.30121,37.56342],[-122.30174,37.56391],[-122.30208,37.56423],[-122.30208,37.56423],[-122.30235,37.56447],[-122.30299,37.56503],[-122.30318,37.56523],[-122.30335,37.56542],[-122.30353,37.56571],[-122.30374,37.56603],[-122.30391,37.56628],[-122.30396,37.56633],[-122.30405,37.56644],[-122.30438,37.56676],[-122.30455,37.56692],[-122.30455,37.56692],[-122.30513,37.56747],[-122.30601,37.56825],[-122.3063,37.56853],[-122.3063,37.56853],[-122.30659,37.56879],[-122.30745,37.56956],[-122.30848,37.57049],[-122.30855,37.57056],[-122.30857,37.5706],[-122.30912,37.57114],[-122.30922,37.57124],[-122.30979,37.57176],[-122.31001,37.57196],[-122.31001,37.57196],[-122.31038,37.57231],[-122.31075,37.57265],[-122.31125,37.57314],[-122.31135,37.57323],[-122.31144,37.57317],[-122.3121,37.57272],[-122.31229,37.57259],[-122.31243,37.57249],[-122.31261,37.57234],[-122.31274,37.57222],[-122.31287,37.5721],[-122.31323,37.57172],[-122.31356,37.57138],[-122.31386,37.57109],[-122.31399,37.57095],[-122.31413,37.57081],[-122.31424,37.57071],[-122.31438,37.5706],[-122.31449,37.57051],[-122.31458,37.57045],[-122.31478,37.57033],[-122.31484,37.5703],[-122.31495,37.57025],[-122.31501,37.57023],[-122.31514,37.57019],[-122.31532,37.57015],[-122.31555,37.5701],[-122.31567,37.57007],[-122.31574,37.57005],[-122.31581,37.57002],[-122.31589,37.56998],[-122.31598,37.56992],[-122.31617,37.56979],[-122.31634,37.56968],[-122.31643,37.56962],[-122.31667,37.56946],[-122.31699,37.56924],[-122.31699,37.56924],[-122.31732,37.56902],[-122.31755,37.56886],[-122.31829,37.56834],[-122.31849,37.5682],[-122.31849,37.5682],[-122.31871,37.56805],[-122.31927,37.56769],[-122.32006,37.56713],[-122.32089,37.5679],[-122.32145,37.56751],[-122.32167,37.56736],[-122.3225,37.56813],[-122.32275,37.56796],[-122.32314,37.56773],[-122.3232,37.56769],[-122.32326,37.56765],[-122.32333,37.56759],[-122.32355,37.56743],[-122.32357,37.56741],[-122.32384,37.56723],[-122.32411,37.56706],[-122.3243,37.56724],[-122.32461,37.56754],[-122.32506,37.56723],[-122.3263,37.5666],[-122.32629,37.56654],[-122.32586,37.56611],[-122.3256,37.56586]]];
const ROUTE_250_STOPS = [
  [37.533776, -122.337067, 'CSM Transit Ctr'],
  [37.531649, -122.332549, 'W Hillsdale Blvd & Clearview Way'],
  [37.532866, -122.326769, 'Hillsdale Blvd & Glendora Dr'],
  [37.529698, -122.321904, 'Hillsdale Blvd & Caxton Ct'],
  [37.530333, -122.311878, 'Hillsdale Blvd at Fernwood St'],
  [37.533781, -122.304168, 'W Hillsdale Blvd & Hacienda St'],
  [37.53525, -122.299696, 'W Hillsdale Blvd & Edison St-Bay 7'],
  [37.537881, -122.298087, 'El Camino Real & Hillsdale Blvd'],
  [37.540266, -122.29772, 'Franklin Pkwy & Delaware St'],
  [37.540653, -122.294822, 'Franklin Pkwy & Curtis St'],
  [37.542752, -122.292222, 'Franklin Pkwy & Saratoga Dr'],
  [37.542075, -122.290501, 'Hillsdale Blvd & Saratoga Dr'],
  [37.545367, -122.284425, 'S Norfolk St & E Hillsdale Blvd'],
  [37.543373, -122.284883, 'La Selva St & Casa De Campo'],
  [37.541109, -122.283775, 'Casa De Campo & La Selva St'],
  [37.54448, -122.283735, 'La Selva St & Los Prados St'],
  [37.546868, -122.28548, 'S Norfolk St & E Hillsdale Blvd'],
  [37.549416, -122.287988, 'S Norfolk St & Marina Ct'],
  [37.55332, -122.290693, 'S Norfolk St & Fashion Island Blvd'],
  [37.555816, -122.293497, 'S Norfolk St & Susan Ct'],
  [37.558055, -122.295882, 'S Norfolk St & Stanford Ave'],
  [37.561854, -122.299441, 'S Norfolk St & Lodi Ave'],
  [37.564273, -122.302019, 'S Norfolk St & Kehoe Ave'],
  [37.566961, -122.304487, 'S Norfolk St & Dale Ave'],
  [37.568567, -122.306237, 'S Norfolk St & Cottage Grove Ave'],
  [37.57199, -122.309963, 'S Norfolk St & Shoreview Ave'],
  [37.569311, -122.317067, 'E 3rd Ave & S Humboldt St'],
  [37.568257, -122.318563, 'E 3rd Ave & S Fremont St'],
  [37.567253, -122.323858, '1st Ave & B St.'],
  [37.565832, -122.325644, 'S San Mateo Dr & 2nd Ave']
];

// Global state
let map;
let busMarkers = {};
let routePolylines = {};
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

function drawRoute250Stops() {
  ROUTE_250_STOPS.forEach(stop => {
    const [lat, lon, name] = stop;

    L.circleMarker([lat, lon], {
      radius: 6,
      color: '#0066cc',
      fillColor: '#0066cc',
      fillOpacity: 1
    })
    .addTo(map)
    .bindPopup(`<b>${name}</b>`);
  });
}






  // Draw Route 250
  drawRoute250();
  drawRoute250Stops();
}

// Draw Route 250 on the map
function drawRoute250() {
  const color = CONFIG.routeColors['250'];
  
  ROUTE_250_COORDS.forEach((path, index) => {
    // Convert [lng, lat] to [lat, lng] for Leaflet
    const latLngs = path.map(coord => [coord[1], coord[0]]);
    
    const polyline = L.polyline(latLngs, {
      color: color,
      weight: 4,
      opacity: 0.7,
      smoothFactor: 1
    }).addTo(map);
    
    routePolylines[`250_${index}`] = polyline;
  });
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
  
  select.innerHTML = '<option value="0">All Routes</option>';
  
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

//    // Try direct API call first
//    let response;
//    try {
//      response = await fetch('/get-vehicle-positions');
//      if (!response.ok) throw new Error('Direct fetch failed');
//    } catch (directError) {
//      // Fallback to CORS proxy
//      response = await fetch(CONFIG.corsProxy + encodeURIComponent(CONFIG.apiUrl));
//    }
//
//    if (!response.ok) {
//      throw new Error(`HTTP error! status: ${response.status}`);
//    }
    response = await fetch('/get-vehicle-positions');

    const data = await response.json();
      console.log(data.Entities)
    
    // Parse GTFS Realtime data
      if (data.Entities) {
        let vehicles = data.Entities
          .filter(entity => entity.Vehicle && entity.Vehicle.Position)
          .map(entity => ({
            id: entity.id,
            vehicle: entity.Vehicle.Vehicle,
            trip: entity.Vehicle.Trip,
            position: entity.vehicle.position,
            Timestamp: entity.vehicle.timestamp,
            StopId: entity.vehicle.stopId,
            CurrentStopSequence: entity.vehicle.currentStopSequence,
            CurrentStatus: entity.Vehicle.CurrentStatus
          }));

        vehicles.forEach(v => {
          let lat = v.position.latitude;
          let lon = v.position.longitude;
            console.log(lat)
          if (markers[v.id]) {
            // Update existing marker location
            markers[v.id].setLatLng([lat, lon]);

            // Optionally update popup content if needed
            let popupContent = `Trip: ${v.trip ? v.trip.trip_id : 'N/A'}<br/>
                                Stop ID: ${v.stopId || 'N/A'}<br/>
                                Status: ${v.currentStatus || 'N/A'}`;
            markers[v.id].getPopup().setContent(popupContent);
          } else {
            // Create new marker and add to map
            let marker = L.marker([lat, lon]).addTo(map);
            let popupContent = `Trip: ${v.trip ? v.trip.trip_id : 'N/A'}<br/>
                                Stop ID: ${v.stopId || 'N/A'}<br/>
                                Status: ${v.currentStatus || 'N/A'}`;
            marker.bindPopup(popupContent);
            markers[v.id] = marker;
          }
        });
      } else {
      throw new Error('Invalid data format');
    }

  } catch (error) {
    console.error('Error fetching vehicle data:', error);
    errorMessage.textContent = `Error loading bus data: ${error.message}. Retrying...`;
    errorMessage.style.display = 'block';
    
    setTimeout(() => {
      errorMessage.style.display = 'none';
    }, 60000);
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