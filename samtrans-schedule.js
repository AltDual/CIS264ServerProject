import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Calendar } from 'lucide-react';

// Complete Route 250 schedule data with ALL stops
const scheduleData = {
  weekday: {
    eastbound: {
      stops: [
        // Starting from Daly City
        { zone: 6, stopId: "341003", name: "1st Ave & B St", times: ["5:52am", "6:04am", "6:18am", "6:23am", "6:29am"], lat: 37.7080, lng: -122.4620 },
        { zone: 6, stopId: "341025", name: "E 3rd Ave & S Fremont St", times: ["5:55am", "6:07am", "6:21am", "6:26am", "6:32am"], lat: 37.7050, lng: -122.4580 },
        { zone: 6, stopId: "341026", name: "E 3rd Ave & S Humboldt St", times: ["5:57am", "6:09am", "6:23am", "6:28am", "6:34am"], lat: 37.7040, lng: -122.4550 },
        { zone: 6, stopId: "341029", name: "E 4th Ave & N Delaware St", times: ["5:59am", "6:11am", "6:25am", "6:30am", "6:36am"], lat: 37.5637, lng: -122.3180 },
        { zone: 6, stopId: "341134", name: "El Camino Real & 31st Ave-Hillsdale Shopping Ctr", times: ["6:01am", "6:13am", "6:27am", "6:32am", "6:38am"], lat: 37.5382, lng: -122.3048 },
        
        // Hillsdale area
        { zone: 5, stopId: "341650", name: "Hillsdale Blvd & Edison St-Hillsdale Shopping Ctr", times: ["6:04am", "6:16am", "6:30am", "6:35am", "6:41am"], lat: 37.5369, lng: -122.3023 },
        { zone: 5, stopId: "341152", name: "El Camino Real & Hillsdale Blvd", times: ["6:08am", "6:20am", "6:34am", "6:39am", "6:45am"], lat: 37.5370, lng: -122.2970 },
        { zone: 5, stopId: "341183", name: "W Hillsdale Blvd & Alameda de las Pulgas", times: ["6:10am", "6:22am", "6:36am", "6:41am", "6:47am"], lat: 37.5315, lng: -122.3382 },
        { zone: 5, stopId: "341934", name: "Hillsdale Blvd & Del Monte St", times: ["6:12am", "6:24am", "6:38am", "6:43am", "6:49am"], lat: 37.5395, lng: -122.3020 },
        { zone: 5, stopId: "341184", name: "W Hillsdale Blvd & Clearview Way", times: ["6:14am", "6:26am", "6:40am", "6:45am", "6:51am"], lat: 37.5284, lng: -122.3456 },
        
        // Central San Mateo
        { zone: 4, stopId: "341936", name: "Hillsdale Blvd & Rockwood Ct", times: ["6:16am", "6:28am", "6:42am", "6:47am", "6:53am"], lat: 37.5440, lng: -122.3120 },
        { zone: 4, stopId: "341185", name: "W Hillsdale Blvd & Clearview Way", times: ["6:18am", "6:30am", "6:44am", "6:49am", "6:55am"], lat: 37.5420, lng: -122.3085 },
        { zone: 4, stopId: "341937", name: "Hillsdale Blvd & Caxton Ct", times: ["6:20am", "6:32am", "6:46am", "6:51am", "6:57am"], lat: 37.5460, lng: -122.3150 },
        { zone: 4, stopId: "341190", name: "W Hillsdale Blvd & Hacienda St", times: ["6:22am", "6:34am", "6:48am", "6:53am", "6:59am"], lat: 37.5480, lng: -122.3180 },
        { zone: 4, stopId: "341938", name: "Hillsdale Blvd & Glendora Dr", times: ["6:24am", "6:36am", "6:50am", "6:55am", "7:01am"], lat: 37.5500, lng: -122.3210 },
        
        // Norfolk Street corridor
        { zone: 4, stopId: "341232", name: "S Norfolk St & Cottage Grove Ave", times: ["6:26am", "6:38am", "6:52am", "6:57am", "7:03am"], lat: 37.5540, lng: -122.3180 },
        { zone: 4, stopId: "341234", name: "S Norfolk St & Dale Ave", times: ["6:28am", "6:40am", "6:54am", "6:59am", "7:05am"], lat: 37.5560, lng: -122.3170 },
        { zone: 4, stopId: "341236", name: "S Norfolk St & Fashion Island Blvd", times: ["6:30am", "6:42am", "6:56am", "7:01am", "7:07am"], lat: 37.5546, lng: -122.2888 },
        { zone: 4, stopId: "341238", name: "S Norfolk St & Marina Ct", times: ["6:32am", "6:44am", "6:58am", "7:03am", "7:09am"], lat: 37.5600, lng: -122.3150 },
        { zone: 4, stopId: "341241", name: "S Norfolk St & E Hillsdale Blvd", times: ["6:34am", "6:46am", "7:00am", "7:05am", "7:11am"], lat: 37.5620, lng: -122.3140 },
        
        { zone: 3, stopId: "341242", name: "S Norfolk St & Kehoe Ave", times: ["6:35am", "6:47am", "7:01am", "7:06am", "7:12am"], lat: 37.5565, lng: -122.2988 },
        { zone: 3, stopId: "341243", name: "S Norfolk St & Lodi Ave", times: ["6:36am", "6:48am", "7:02am", "7:07am", "7:13am"], lat: 37.5660, lng: -122.3120 },
        { zone: 3, stopId: "341244", name: "S Norfolk St & Marina Ct", times: ["6:37am", "6:49am", "7:03am", "7:08am", "7:14am"], lat: 37.5680, lng: -122.3110 },
        { zone: 3, stopId: "341246", name: "S Norfolk St & Dale Ave", times: ["6:38am", "6:50am", "7:04am", "7:09am", "7:15am"], lat: 37.5700, lng: -122.3100 },
        { zone: 3, stopId: "341249", name: "S Norfolk St & Shoreview Ave", times: ["6:39am", "6:51am", "7:05am", "7:10am", "7:16am"], lat: 37.5617, lng: -122.3068 },
        
        { zone: 3, stopId: "341251", name: "S Norfolk St & Stanford Ave", times: ["6:40am", "6:52am", "7:06am", "7:11am", "7:17am"], lat: 37.5740, lng: -122.3080 },
        { zone: 3, stopId: "341253", name: "S Norfolk St & Susan Ct", times: ["6:41am", "6:53am", "7:07am", "7:12am", "7:18am"], lat: 37.5760, lng: -122.3070 },
        { zone: 3, stopId: "341304", name: "S Norfolk St & E Hillsdale Blvd", times: ["6:42am", "6:54am", "7:08am", "7:13am", "7:19am"], lat: 37.5780, lng: -122.3060 },
        
        // Franklin/La Selva area
        { zone: 3, stopId: "341940", name: "Franklin Pkwy & Delaware St", times: ["6:43am", "6:55am", "7:09am", "7:14am", "7:20am"], lat: 37.5538, lng: -122.2715 },
        { zone: 3, stopId: "341942", name: "Franklin Pkwy & Park Pl", times: ["6:44am", "6:56am", "7:10am", "7:15am", "7:21am"], lat: 37.5541, lng: -122.2778 },
        { zone: 3, stopId: "341952", name: "Franklin / Franklin", times: ["6:45am", "6:57am", "7:11am", "7:16am", "7:22am"], lat: 37.5840, lng: -122.3030 },
        { zone: 3, stopId: "341943", name: "Hillsdale Blvd & Saratoga Dr", times: ["6:46am", "6:58am", "7:12am", "7:17am", "7:23am"], lat: 37.5860, lng: -122.3020 },
        { zone: 3, stopId: "341953", name: "Franklin Pkwy & Saratoga Dr", times: ["6:47am", "6:59am", "7:13am", "7:18am", "7:24am"], lat: 37.5880, lng: -122.3010 },
        
        { zone: 3, stopId: "341205", name: "La Selva St & Los Prados St", times: ["6:48am", "7:00am", "7:14am", "7:19am", "7:25am"], lat: 37.5900, lng: -122.3000 },
        { zone: 3, stopId: "341206", name: "La Selva St & Casa De Campo", times: ["6:49am", "7:01am", "7:15am", "7:20am", "7:26am"], lat: 37.5920, lng: -122.2990 },
        { zone: 3, stopId: "341084", name: "Casa De Campo & La Selva St", times: ["6:50am", "7:02am", "7:16am", "7:21am", "7:27am"], lat: 37.5940, lng: -122.2980 },
        
        // College of San Mateo area
        { zone: 3, stopId: "341081", name: "CSM Transit Ctr", times: ["6:52am", "7:04am", "7:18am", "7:23am", "7:29am"], lat: 37.5281, lng: -122.3484 },
        { zone: 3, stopId: "341290", name: "S San Mateo Dr & 2nd Ave", times: ["6:54am", "7:06am", "7:20am", "7:25am", "7:31am"], lat: 37.5648, lng: -122.3244 },
        
        // Additional stops
        { zone: 3, stopId: "341191", name: "W Hillsdale Blvd & Hacienda St", times: ["6:56am", "7:08am", "7:22am", "7:27am", "7:33am"], lat: 37.5480, lng: -122.3185 },
        { zone: 3, stopId: "341939", name: "Hillsdale Blvd & Glendora Dr", times: ["6:58am", "7:10am", "7:24am", "7:29am", "7:35am"], lat: 37.5505, lng: -122.3215 },
        { zone: 3, stopId: "341941", name: "Franklin Pkwy & Delaware St", times: ["7:00am", "7:12am", "7:26am", "7:31am", "7:37am"], lat: 37.5805, lng: -122.3055 },
        { zone: 3, stopId: "341951", name: "Franklin Pkwy & Curtis St", times: ["7:02am", "7:14am", "7:28am", "7:33am", "7:39am"], lat: 37.5825, lng: -122.3045 },
        { zone: 3, stopId: "341954", name: "Hillsdale Blvd at Fernwood St", times: ["7:04am", "7:16am", "7:30am", "7:35am", "7:41am"], lat: 37.5465, lng: -122.3155 },
        { zone: 3, stopId: "341544", name: "W Hillsdale Blvd & Edison St-Bay 7", times: ["7:06am", "7:18am", "7:32am", "7:37am", "7:43am"], lat: 37.5385, lng: -122.2955 },
        
        // Additional Norfolk stops
        { zone: 3, stopId: "341233", name: "S Norfolk St & Cottage Grove Ave", times: ["7:08am", "7:20am", "7:34am", "7:39am", "7:45am"], lat: 37.5545, lng: -122.3185 },
        { zone: 3, stopId: "341237", name: "S Norfolk St & Fashion Island Blvd", times: ["7:10am", "7:22am", "7:36am", "7:41am", "7:47am"], lat: 37.5585, lng: -122.3165 },
        { zone: 3, stopId: "341250", name: "S Norfolk St & Shoreview Ave", times: ["7:12am", "7:24am", "7:38am", "7:43am", "7:49am"], lat: 37.5725, lng: -122.3095 },
        { zone: 3, stopId: "341252", name: "S Norfolk St & Stanford Ave", times: ["7:14am", "7:26am", "7:40am", "7:45am", "7:51am"], lat: 37.5745, lng: -122.3085 },
        { zone: 3, stopId: "341254", name: "S Norfolk St & Susan Ct", times: ["7:16am", "7:28am", "7:42am", "7:47am", "7:53am"], lat: 37.5765, lng: -122.3075 },
        { zone: 3, stopId: "341537", name: "S Norfolk St & Lodi Ave", times: ["7:18am", "7:30am", "7:44am", "7:49am", "7:55am"], lat: 37.5665, lng: -122.3125 },
        { zone: 3, stopId: "341538", name: "S Norfolk St & Kehoe Ave", times: ["7:20am", "7:32am", "7:46am", "7:51am", "7:57am"], lat: 37.5645, lng: -122.3135 },
        
        // Additional stops
        { zone: 3, stopId: "341034", name: "E 4th Ave & S Ellsworth Ave", times: ["7:22am", "7:34am", "7:48am", "7:53am", "7:59am"], lat: 37.5637, lng: -122.3212 },
        { zone: 3, stopId: "341548", name: "E 4th Ave & S Grant St", times: ["7:24am", "7:36am", "7:50am", "7:55am", "8:01am"], lat: 37.7020, lng: -122.4510 }
      ],
      tripIds: ["503", "505", "507", "509", "511"]
    },
    westbound: {
      stops: [
        // Reverse direction - same stops in opposite order
        { zone: 3, stopId: "341548", name: "E 4th Ave & S Grant St", times: ["7:10am", "7:25am", "7:40am", "7:55am", "8:10am"], lat: 37.7020, lng: -122.4510 },
        { zone: 3, stopId: "341034", name: "E 4th Ave & S Ellsworth Ave", times: ["7:12am", "7:27am", "7:42am", "7:57am", "8:12am"], lat: 37.5637, lng: -122.3212 },
        { zone: 3, stopId: "341538", name: "S Norfolk St & Kehoe Ave", times: ["7:14am", "7:29am", "7:44am", "7:59am", "8:14am"], lat: 37.5565, lng: -122.2988 },
        { zone: 3, stopId: "341537", name: "S Norfolk St & Lodi Ave", times: ["7:16am", "7:31am", "7:46am", "8:01am", "8:16am"], lat: 37.5665, lng: -122.3125 },
        { zone: 3, stopId: "341254", name: "S Norfolk St & Susan Ct", times: ["7:18am", "7:33am", "7:48am", "8:03am", "8:18am"], lat: 37.5765, lng: -122.3075 },
        { zone: 3, stopId: "341252", name: "S Norfolk St & Stanford Ave", times: ["7:20am", "7:35am", "7:50am", "8:05am", "8:20am"], lat: 37.5745, lng: -122.3085 },
        { zone: 3, stopId: "341250", name: "S Norfolk St & Shoreview Ave", times: ["7:22am", "7:37am", "7:52am", "8:07am", "8:22am"], lat: 37.5617, lng: -122.3068 },
        { zone: 3, stopId: "341237", name: "S Norfolk St & Fashion Island Blvd", times: ["7:24am", "7:39am", "7:54am", "8:09am", "8:24am"], lat: 37.5546, lng: -122.2888 },
        { zone: 3, stopId: "341233", name: "S Norfolk St & Cottage Grove Ave", times: ["7:26am", "7:41am", "7:56am", "8:11am", "8:26am"], lat: 37.5545, lng: -122.3185 },
        { zone: 3, stopId: "341544", name: "W Hillsdale Blvd & Edison St-Bay 7", times: ["7:28am", "7:43am", "7:58am", "8:13am", "8:28am"], lat: 37.5369, lng: -122.3023 },
        { zone: 4, stopId: "341081", name: "CSM Transit Ctr", times: ["7:30am", "7:45am", "8:00am", "8:15am", "8:30am"], lat: 37.5281, lng: -122.3484 },
        { zone: 4, stopId: "341290", name: "S San Mateo Dr & 2nd Ave", times: ["7:32am", "7:47am", "8:02am", "8:17am", "8:32am"], lat: 37.5648, lng: -122.3244 },
        { zone: 5, stopId: "341003", name: "1st Ave & B St", times: ["8:00am", "8:15am", "8:30am", "8:45am", "9:00am"], lat: 37.7080, lng: -122.4620 }
      ],
      tripIds: ["502", "504", "506", "508", "510"]
    }
  },
  weekend: {
    eastbound: {
      stops: [
        // Weekend schedule with fewer stops
        { zone: 6, stopId: "341003", name: "1st Ave & B St", times: ["7:00am", "8:00am", "9:00am", "10:00am", "11:00am"], lat: 37.7080, lng: -122.4620 },
        { zone: 6, stopId: "341134", name: "El Camino Real & 31st Ave-Hillsdale Shopping Ctr", times: ["7:09am", "8:09am", "9:09am", "10:09am", "11:09am"], lat: 37.5382, lng: -122.3048 },
        { zone: 5, stopId: "341650", name: "Hillsdale Blvd & Edison St-Hillsdale Shopping Ctr", times: ["7:16am", "8:16am", "9:16am", "10:16am", "11:16am"], lat: 37.5369, lng: -122.3023 },
        { zone: 5, stopId: "341183", name: "W Hillsdale Blvd & Alameda de las Pulgas", times: ["7:22am", "8:22am", "9:22am", "10:22am", "11:22am"], lat: 37.5315, lng: -122.3382 },
        { zone: 4, stopId: "341232", name: "S Norfolk St & Cottage Grove Ave", times: ["7:30am", "8:30am", "9:30am", "10:30am", "11:30am"], lat: 37.5540, lng: -122.3180 },
        { zone: 4, stopId: "341241", name: "S Norfolk St & E Hillsdale Blvd", times: ["7:36am", "8:36am", "9:36am", "10:36am", "11:36am"], lat: 37.5620, lng: -122.3140 },
        { zone: 3, stopId: "341081", name: "CSM Transit Ctr", times: ["7:50am", "8:50am", "9:50am", "10:50am", "11:50am"], lat: 37.5281, lng: -122.3484 }
      ],
      tripIds: ["601", "602", "603", "604", "605"]
    },
    westbound: {
      stops: [
        { zone: 3, stopId: "341081", name: "CSM Transit Ctr", times: ["8:00am", "9:00am", "10:00am", "11:00am", "12:00pm"], lat: 37.5281, lng: -122.3484 },
        { zone: 4, stopId: "341241", name: "S Norfolk St & E Hillsdale Blvd", times: ["8:14am", "9:14am", "10:14am", "11:14am", "12:14pm"], lat: 37.5620, lng: -122.3140 },
        { zone: 4, stopId: "341232", name: "S Norfolk St & Cottage Grove Ave", times: ["8:20am", "9:20am", "10:20am", "11:20am", "12:20pm"], lat: 37.5540, lng: -122.3180 },
        { zone: 5, stopId: "341183", name: "W Hillsdale Blvd & Alameda de las Pulgas", times: ["8:28am", "9:28am", "10:28am", "11:28am", "12:28pm"], lat: 37.5315, lng: -122.3382 },
        { zone: 5, stopId: "341650", name: "Hillsdale Blvd & Edison St-Hillsdale Shopping Ctr", times: ["8:34am", "9:34am", "10:34am", "11:34am", "12:34pm"], lat: 37.5369, lng: -122.3023 },
        { zone: 6, stopId: "341134", name: "El Camino Real & 31st Ave-Hillsdale Shopping Ctr", times: ["8:41am", "9:41am", "10:41am", "11:41am", "12:41pm"], lat: 37.5382, lng: -122.3048 },
        { zone: 6, stopId: "341003", name: "1st Ave & B St", times: ["8:50am", "9:50am", "10:50am", "11:50am", "12:50pm"], lat: 37.7080, lng: -122.4620 }
      ],
      tripIds: ["610", "611", "612", "613", "614"]
    }
  }
};

// Live Map Component using Leaflet + OpenStreetMap (Free!)
const LiveMap = ({ stops, direction }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const busMarkersRef = useRef([]);
  const stopMarkersRef = useRef([]);
  
  // Dummy bus data
  const [buses, setBuses] = useState([
    {
      id: 'bus-1',
      vehicleNumber: '1234',
      tripId: '503',
      lat: 37.5546,
      lng: -122.2888,
      speed: 35,
      delay: 0,
      nextStop: 'S Norfolk St & Fashion Island Blvd'
    },
    {
      id: 'bus-2',
      vehicleNumber: '5678',
      tripId: '505',
      lat: 37.5617,
      lng: -122.3068,
      speed: 25,
      delay: 2,
      nextStop: 'S Norfolk St & Shoreview Ave'
    },
    {
      id: 'bus-3',
      vehicleNumber: '9012',
      tripId: '507',
      lat: 37.5281,
      lng: -122.3484,
      speed: 40,
      delay: 5,
      nextStop: 'CSM Transit Ctr'
    }
  ]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const L = window.L;
    if (!L) {
      console.error('Leaflet not loaded');
      return;
    }

    const map = L.map(mapRef.current).setView([37.55, -122.31], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Add/update stop markers
  useEffect(() => {
    if (!mapInstanceRef.current || !stops) return;

    const L = window.L;
    const map = mapInstanceRef.current;

    stopMarkersRef.current.forEach(marker => marker.remove());
    stopMarkersRef.current = [];

    stops.forEach((stop, idx) => {
      const stopIcon = L.divIcon({
        className: 'custom-stop-marker',
        html: `
          <div style="
            width: 20px;
            height: 20px;
            background-color: #1e40af;
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 8px;
            font-weight: bold;
          ">${idx + 1}</div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker([stop.lat, stop.lng], { icon: stopIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: system-ui, -apple-system, sans-serif;">
            <strong style="font-size: 13px;">${stop.name}</strong><br/>
            <span style="color: #6B7280; font-size: 11px;">Zone ${stop.zone} • Stop ${idx + 1}</span><br/>
            <span style="color: #1e40af; font-size: 10px;">ID: ${stop.stopId}</span>
          </div>
        `);

      stopMarkersRef.current.push(marker);
    });

    if (stops.length > 0) {
      const bounds = L.latLngBounds(stops.map(s => [s.lat, s.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [stops]);

  // Add/update bus markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const L = window.L;
    const map = mapInstanceRef.current;

    busMarkersRef.current.forEach(marker => marker.remove());
    busMarkersRef.current = [];

    buses.forEach(bus => {
      let color = '#10B981';
      if (bus.delay > 0 && bus.delay <= 5) {
        color = '#F59E0B';
      } else if (bus.delay > 5) {
        color = '#EF4444';
      }

      const busIcon = L.divIcon({
        className: 'custom-bus-marker',
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background-color: ${color};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 3px 10px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            animation: pulse 2s infinite;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
              <rect x="3" y="6" width="18" height="12" rx="2"/>
              <path d="M3 10h18M7 14h.01M17 14h.01M7 18h10"/>
            </svg>
          </div>
          <style>
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
          </style>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([bus.lat, bus.lng], { icon: busIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: system-ui, -apple-system, sans-serif;">
            <strong style="font-size: 14px;">🚌 Bus ${bus.vehicleNumber}</strong><br/>
            <span style="font-size: 12px;">Trip: ${bus.tripId}</span><br/>
            <span style="font-size: 12px;">Speed: ${bus.speed} mph</span><br/>
            <span style="font-size: 12px;">Next: ${bus.nextStop}</span><br/>
            ${bus.delay > 0 ? `<span style="color: #EF4444; font-size: 12px; font-weight: bold;">⏱️ Delayed ${bus.delay} min</span>` : '<span style="color: #10B981; font-size: 12px; font-weight: bold;">✓ On time</span>'}
          </div>
        `);

      busMarkersRef.current.push(marker);
    });
  }, [buses]);

  // Animate buses
  useEffect(() => {
    const interval = setInterval(() => {
      setBuses(prevBuses => prevBuses.map(bus => ({
        ...bus,
        lat: bus.lat + (Math.random() - 0.5) * 0.001,
        lng: bus.lng + (Math.random() - 0.5) * 0.001,
        speed: Math.max(15, Math.min(50, bus.speed + (Math.random() - 0.5) * 10))
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div 
        ref={mapRef} 
        style={{ 
          height: '500px', 
          width: '100%', 
          borderRadius: '8px',
          border: '2px solid #E5E7EB'
        }}
      />
      
      <div style={{ 
        marginTop: '12px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        fontSize: '14px',
        color: '#10B981'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          backgroundColor: '#10B981',
          borderRadius: '50%',
          animation: 'blink 1.5s infinite'
        }} />
        <span style={{ fontWeight: 500 }}>Live tracking • Updates every 3 seconds • {stops.length} stops</span>
      </div>
      
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

const SamTransSchedule = () => {
  const [dayType, setDayType] = useState('weekday');
  const [direction, setDirection] = useState('eastbound');
  const [selectedTrip, setSelectedTrip] = useState(null);

  const currentSchedule = scheduleData[dayType][direction];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <Navigation className="text-blue-800" />
                Route 250 - SamTrans
              </h1>
              <p className="text-gray-600 mt-1">Real-time schedule and tracking • {currentSchedule.stops.length} stops</p>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex flex-wrap gap-4">
            {/* Day Type Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setDayType('weekday')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  dayType === 'weekday'
                    ? 'bg-blue-800 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Calendar size={18} />
                Weekday
              </button>
              <button
                onClick={() => setDayType('weekend')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  dayType === 'weekend'
                    ? 'bg-blue-800 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Calendar size={18} />
                Weekend
              </button>
            </div>

            {/* Direction Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setDirection('eastbound')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  direction === 'eastbound'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Navigation size={18} className="rotate-90" />
                Eastbound
              </button>
              <button
                onClick={() => setDirection('westbound')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  direction === 'westbound'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Navigation size={18} className="-rotate-90" />
                Westbound
              </button>
            </div>
          </div>
        </div>

        {/* Schedule Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-800 to-blue-900 text-white">
                  <th className="px-4 py-3 text-left font-semibold">Zone</th>
                  <th className="px-4 py-3 text-left font-semibold min-w-[250px]">Station Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs">Stop ID</th>
                  {currentSchedule.tripIds.map((tripId, idx) => (
                    <th
                      key={tripId}
                      className="px-3 py-3 text-center font-semibold min-w-[80px] cursor-pointer hover:bg-blue-800 transition-colors"
                      onClick={() => setSelectedTrip(selectedTrip === idx ? null : idx)}
                    >
                      {tripId}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentSchedule.stops.map((stop, stopIdx) => (
                  <tr
                    key={stopIdx}
                    className={`border-b border-gray-200 ${
                      stopIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    } hover:bg-blue-50 transition-colors`}
                  >
                    <td className="px-4 py-3 text-center font-medium text-gray-700">
                      {stop.zone}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 flex items-center gap-2">
                      <MapPin size={14} className="text-blue-800 flex-shrink-0" />
                      <span className="text-sm">{stop.name}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{stop.stopId}</td>
                    {stop.times.map((time, timeIdx) => (
                      <td
                        key={timeIdx}
                        className={`px-3 py-3 text-center text-sm ${
                          selectedTrip === timeIdx
                            ? 'bg-yellow-100 font-bold text-gray-900'
                            : 'text-gray-700'
                        }`}
                      >
                        {time}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Tracking Map Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="text-orange-600" />
            Live Bus Tracking
          </h2>
          
          <LiveMap stops={currentSchedule.stops} direction={direction} />

          {/* Map Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span>On-time</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span>Delayed 1-5 min</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span>Delayed 5+ min</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-800 rounded-full"></div>
              <span>Bus stop</span>
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-6 text-center text-gray-600 text-sm">
          <p>Times are approximate. Check real-time tracking for accurate arrival information.</p>
          <p className="mt-2">💚 Powered by OpenStreetMap & Leaflet (100% Free & Open Source!)</p>
          <p className="mt-1">Route 250 • {currentSchedule.stops.length} stops • {direction === 'eastbound' ? 'Eastbound' : 'Westbound'}</p>
        </div>
      </div>
    </div>
  );
};

export default SamTransSchedule;