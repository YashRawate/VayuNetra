import { create } from 'zustand';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

export const useSensorStore = create((set, get) => ({
  stations: [],
  isConnected: false,
  soundAlertsEnabled: false,

  setSoundAlertsEnabled: (enabled) => set({ soundAlertsEnabled: enabled }),

  initSocket: () => {
    if (get().isConnected) return; // Prevent multiple connections

    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      set({ isConnected: true });
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });

    socket.on('telemetry:init', (data) => {
      set({ stations: data });
    });

    socket.on('telemetry:update', (updates) => {
      const { stations, soundAlertsEnabled } = get();
      
      const newStations = stations.map(station => {
        const update = updates.find(u => u.id === station.id);
        if (update) {
          // Check for severe crossing to trigger audio if enabled
          if (soundAlertsEnabled && update.category === 'Severe' && station.category !== 'Severe') {
            playAlertSound();
          }
          return { ...station, ...update };
        }
        return station;
      });

      set({ stations: newStations });
    });
  }
}));

function playAlertSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
    oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1); // jump to A5
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.3);
  } catch(e) {
    console.error('Audio alert failed', e);
  }
}
