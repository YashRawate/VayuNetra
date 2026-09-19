/**
 * API Service for Delhi NCR AQI Dashboard
 * Adheres strictly to the Spring Boot / DynamoDB contract specified in the Frontend Spec.
 * Provides live backend fetching with automatic fallback to high-fidelity mock data.
 */

// Configurable API base URL (Spring Boot server, e.g. http://localhost:8080)
let apiBaseUrl = localStorage.getItem('AQI_API_BASE_URL') || '';

export const getApiBaseUrl = () => apiBaseUrl;
export const setApiBaseUrl = (url) => {
  apiBaseUrl = url.trim();
  if (apiBaseUrl) {
    localStorage.setItem('AQI_API_BASE_URL', apiBaseUrl);
  } else {
    localStorage.removeItem('AQI_API_BASE_URL');
  }
};

/**
 * Standard CPCB PM2.5 to AQI conversion helper
 */
export function pm25ToAqi(pm25) {
  if (pm25 <= 30) return Math.round((50 / 30) * pm25);
  if (pm25 <= 60) return Math.round(50 + ((100 - 51) / (60 - 31)) * (pm25 - 30));
  if (pm25 <= 90) return Math.round(101 + ((200 - 101) / (90 - 61)) * (pm25 - 60));
  if (pm25 <= 120) return Math.round(201 + ((300 - 201) / (120 - 91)) * (pm25 - 90));
  if (pm25 <= 250) return Math.round(301 + ((400 - 301) / (250 - 121)) * (pm25 - 120));
  // Severe / Emergency (> 250 ug/m3)
  return Math.min(500, Math.round(401 + ((500 - 401) / (380 - 250)) * (pm25 - 250)));
}

/**
 * Realistic 72-hour forecast based on coupled feedback-loop model
 * Simulates nocturnal inversion, diurnal boundary layer expansion, and stubble plume arrival
 */
function generateMock72hrForecast() {
  const forecast = [];
  // Base diurnal cycle starting at night (21:00)
  for (let h = 0; h <= 72; h++) {
    const timeOfDay = (21 + h) % 24; // starting at 21:00
    const isNight = timeOfDay < 6 || timeOfDay >= 19;
    
    // Boundary layer drops at night (inversion trapping) and rises during afternoon
    let pbl = isNight 
      ? 160 + Math.sin(h / 3) * 25 
      : 850 + Math.sin((timeOfDay - 6) / 12 * Math.PI) * 450;
    pbl = Math.max(140, Math.round(pbl));

    // Stubble plume peak arrives around hour 12 - 24
    let plumeFactor = 1.0;
    if (h >= 10 && h <= 30) {
      plumeFactor = 1.35;
    } else if (h > 30 && h <= 54) {
      plumeFactor = 1.15;
    }

    // PM2.5 inversely correlates with PBL height + plume arrival
    let pm25 = (34000 / pbl) * plumeFactor + (Math.sin(h) * 12);
    pm25 = Math.round(Math.max(80, Math.min(420, pm25)) * 10) / 10;

    const aqi = pm25ToAqi(pm25);
    let category = "Moderate";
    if (aqi > 400) category = "Severe";
    else if (aqi > 300) category = "Very Poor";
    else if (aqi > 200) category = "Poor";
    else if (aqi > 100) category = "Moderate";
    else category = "Satisfactory";

    forecast.push({
      hour: h,
      label: h === 0 ? "Now" : (h % 12 === 0 ? `+${h}h` : `+${h}h`),
      pbl_height_m: pbl,
      temp_c: Math.round((isNight ? 11.5 : 22.0) + Math.cos(h / 4) * 2.5 * 10) / 10,
      wind_kmh: Math.round((isNight ? 4.8 : 9.5) + Math.sin(h / 2) * 2 * 10) / 10,
      pm25: pm25,
      aqi: aqi,
      aqi_category: category
    });
  }
  return forecast;
}

const mockForecast72hr = generateMock72hrForecast();

const mockInversionStatus = {
  strength: "Strong",
  pbl_height_m: 180
};

const mockPlumeData = {
  fire_sources: [
    { lat: 30.90, lng: 75.85, intensity: 0.92, location: "Ludhiana Cluster" },
    { lat: 30.24, lng: 75.84, intensity: 0.88, location: "Sangrur North" },
    { lat: 30.21, lng: 74.95, intensity: 0.79, location: "Bathinda Rural" },
    { lat: 29.68, lng: 76.98, intensity: 0.74, location: "Karnal Farm Belt" },
    { lat: 29.51, lng: 75.45, intensity: 0.83, location: "Fatehabad" }
  ],
  wind_direction_deg: 315, // North-West
  wind_speed_kmh: 8.0,
  plume_transit_hours: 14.2
};

const mockStations = [
  {
    station: "ITO, Delhi",
    wind_kmh: 6.2,
    humidity_pct: 58,
    temp_c: 14.1,
    solar_radiation: "Low",
    ventilation_index: "Poor"
  },
  {
    station: "Anand Vihar, Delhi",
    wind_kmh: 4.8,
    humidity_pct: 64,
    temp_c: 13.5,
    solar_radiation: "Low",
    ventilation_index: "Severe"
  },
  {
    station: "Punjabi Bagh, Delhi",
    wind_kmh: 5.5,
    humidity_pct: 60,
    temp_c: 14.0,
    solar_radiation: "Low",
    ventilation_index: "Poor"
  },
  {
    station: "R K Puram, Delhi",
    wind_kmh: 7.1,
    humidity_pct: 54,
    temp_c: 14.8,
    solar_radiation: "Low",
    ventilation_index: "Poor"
  },
  {
    station: "Sector 62, Noida",
    wind_kmh: 5.0,
    humidity_pct: 62,
    temp_c: 13.9,
    solar_radiation: "Low",
    ventilation_index: "Poor"
  },
  {
    station: "Vikas Sadan, Gurugram",
    wind_kmh: 6.8,
    humidity_pct: 52,
    temp_c: 14.5,
    solar_radiation: "Low",
    ventilation_index: "Moderate"
  }
];

/**
 * Fetch wrapper with fallback
 */
async function fetchWithFallback(endpoint, mockData) {
  if (!apiBaseUrl) {
    return { data: mockData, source: 'mock' };
  }
  try {
    const res = await fetch(`${apiBaseUrl}${endpoint}`, {
      signal: AbortSignal.timeout(3000),
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return { data: json, source: 'live' };
  } catch (err) {
    console.warn(`Backend fetch for ${endpoint} failed (${err.message}). Falling back to coupled model mock data.`);
    return { data: mockData, source: 'fallback' };
  }
}

export const fetch72hrForecast = async () => {
  const result = await fetchWithFallback('/forecast/72hr', mockForecast72hr);
  // Ensure each forecast item has computed aqi and formatted label if from raw backend
  const enriched = result.data.map((item, idx) => ({
    ...item,
    aqi: item.aqi || pm25ToAqi(item.pm25),
    label: item.label || (item.hour === 0 ? "Now" : `+${item.hour}h`)
  }));
  return { ...result, data: enriched };
};

export const fetchInversionStatus = async () => {
  return fetchWithFallback('/inversion-status', mockInversionStatus);
};

export const fetchPlumeData = async () => {
  return fetchWithFallback('/plume', mockPlumeData);
};

export const fetchStations = async () => {
  return fetchWithFallback('/stations', mockStations);
};
