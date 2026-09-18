import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // allow all origins for dev mock
    methods: ["GET", "POST"]
  }
});

const STATIONS = [
  { id: 'ito', name: 'ITO, Delhi', lat: 28.6276, lng: 77.2404 },
  { id: 'anand_vihar', name: 'Anand Vihar, Delhi', lat: 28.6476, lng: 77.3158 },
  { id: 'punjabi_bagh', name: 'Punjabi Bagh, Delhi', lat: 28.6738, lng: 77.1306 },
  { id: 'rk_puram', name: 'R K Puram, Delhi', lat: 28.5632, lng: 77.1869 },
  { id: 'sector_62', name: 'Sector 62, Noida', lat: 28.6245, lng: 77.3639 },
  { id: 'vikas_sadan', name: 'Vikas Sadan, Gurugram', lat: 28.4500, lng: 77.0266 },
];

function generateAqi(baseAqi) {
  // Random fluctuation +/- 5
  return Math.max(0, baseAqi + Math.floor(Math.random() * 11) - 5);
}

function getCategory(aqi) {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Satisfactory';
  if (aqi <= 200) return 'Moderate';
  if (aqi <= 300) return 'Poor';
  if (aqi <= 400) return 'Very Poor';
  return 'Severe';
}

// Initial state
const currentData = {
  ito: { aqi: 387, category: 'Severe' },
  anand_vihar: { aqi: 445, category: 'Severe' },
  punjabi_bagh: { aqi: 395, category: 'Severe' },
  rk_puram: { aqi: 340, category: 'Very Poor' },
  sector_62: { aqi: 360, category: 'Very Poor' },
  vikas_sadan: { aqi: 310, category: 'Very Poor' },
};

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send initial data
  const initialPayload = STATIONS.map(s => ({
    id: s.id,
    station: s.name,
    aqi: currentData[s.id].aqi,
    category: currentData[s.id].category,
    lat: s.lat,
    lng: s.lng
  }));
  socket.emit('telemetry:init', initialPayload);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Simulation loop: emit updates every 3 seconds
setInterval(() => {
  const updates = STATIONS.map(s => {
    // 30% chance to fluctuate this tick
    if (Math.random() < 0.3) {
      currentData[s.id].aqi = generateAqi(currentData[s.id].aqi);
      currentData[s.id].category = getCategory(currentData[s.id].aqi);
    }
    return {
      id: s.id,
      station: s.name,
      aqi: currentData[s.id].aqi,
      category: currentData[s.id].category
    };
  });
  
  io.emit('telemetry:update', updates);
}, 3000);

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Mock telemetry server running on http://localhost:${PORT}`);
});
