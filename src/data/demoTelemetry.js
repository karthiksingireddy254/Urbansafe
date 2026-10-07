// UrbanSafe AI - Demo Telemetry Feeds Data

export const TELEMETRY_SOURCES = [
  {
    id: "SRC-TRAF",
    name: "Traffic Density Feed",
    type: "IoT Loop Detectors & Camera Feeds",
    status: "ONLINE",
    lastUpdated: "4s ago",
    recordCount: "1,842,910 pings/day",
    dataQuality: "99.4% Validated",
    latency: "280ms"
  },
  {
    id: "SRC-WEAT",
    name: "Meteorological Telemetry",
    type: "Doppler Radar & Road Surface Sensors",
    status: "ONLINE",
    lastUpdated: "12s ago",
    recordCount: "144,000 readings/day",
    dataQuality: "98.9% Validated",
    latency: "650ms"
  },
  {
    id: "SRC-ROAD",
    name: "Road Infrastructure Telemetry",
    type: "Municipal Maintenance & Pothole Fleet Logs",
    status: "ONLINE",
    lastUpdated: "2m ago",
    recordCount: "38,200 asset nodes",
    dataQuality: "97.6% Validated",
    latency: "1.2s"
  },
  {
    id: "SRC-ACCI",
    name: "Emergency Collision Telemetry",
    type: "CAD Dispatch 911 & Traffic Police CAD",
    status: "ONLINE",
    lastUpdated: "1m ago",
    recordCount: "12,486 historical events",
    dataQuality: "100% Verified",
    latency: "410ms"
  },
  {
    id: "SRC-LOCA",
    name: "Connected Vehicle Telemetry (V2X)",
    type: "Fleet GPS & Anonymized Floating Car Telemetry",
    status: "ONLINE",
    lastUpdated: "2s ago",
    recordCount: "6,410,000 telemetry points",
    dataQuality: "96.8% Validated",
    latency: "190ms"
  }
];

export const INITIAL_STREAM_LOGS = [
  { id: "LOG-901", timestamp: "10:42:18", source: "IoT Loop #412", location: "Downtown Central Expressway", traffic: "89% Critical", weather: "Clear / 18°C", road: "Dry Asphalt", status: "NORMAL" },
  { id: "LOG-902", timestamp: "10:42:15", source: "Surface Sensor #88", location: "Riverfront Boulevard", traffic: "78% High", weather: "Light Mist / 16°C", road: "Wet Surface", status: "WARNING" },
  { id: "LOG-903", timestamp: "10:42:11", source: "Transit Loop #19", location: "Westside Transit Junction", traffic: "82% High", weather: "Overcast / 17°C", road: "Wet Rail Track", status: "HIGH_RISK" },
  { id: "LOG-904", timestamp: "10:42:07", source: "Viaduct Beacon #04", location: "Metro Harbor Causeway", traffic: "61% Moderate", weather: "High Wind / 15°C", road: "High Friction", status: "NORMAL" },
  { id: "LOG-905", timestamp: "10:41:59", source: "Smart Lamp #102", location: "North Tech Corridor", traffic: "54% Moderate", weather: "Clear / 19°C", road: "Clean Asphalt", status: "NORMAL" },
  { id: "LOG-906", timestamp: "10:41:50", source: "Civic Camera #07", location: "Civic Plaza Bypass", traffic: "31% Low", weather: "Clear / 19°C", road: "Good Condition", status: "NORMAL" }
];
