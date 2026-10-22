import { writable } from 'svelte/store';
import mqtt from 'mqtt';

// Dummy data awal dengan template yang kamu minta
export const bins = writable([
  { id_tongsampah: "BIN-01", volume: 20, long: 107.5750, lat: -6.8730, suhu: 28, tilt: 0, alert: 0, timestamp: "2026-10-21T10:00:00Z" }, // Area Polban (contoh)
  { id_tongsampah: "BIN-02", volume: 90, long: 107.5765, lat: -6.8745, suhu: 35, tilt: 0, alert: 1, timestamp: "2026-10-21T10:05:00Z" },
  { id_tongsampah: "BIN-03", volume: 15, long: 107.5740, lat: -6.8750, suhu: 45, tilt: 45, alert: 2, timestamp: "2026-10-21T10:10:00Z" } // Terguling & Panas
]);

export function connectMQTT() {
  // HiveMQ Public Broker via WebSocket
  const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

  client.on('connect', () => {
    console.log('Terhubung ke HiveMQ!');
    client.subscribe('sic/waste/sensors'); 
  });

  client.on('message', (topic, message) => {
    try {
      const newData = JSON.parse(message.toString());
      
      // Update data tong sampah yang ada, atau tambah baru jika ID belum ada
      bins.update(currentBins => {
        const index = currentBins.findIndex(b => b.id_tongsampah === newData.id_tongsampah);
        if (index !== -1) {
          currentBins[index] = { ...currentBins[index], ...newData };
        } else {
          currentBins.push(newData);
        }
        return currentBins;
      });
    } catch (err) {
      console.error('Error parsing MQTT message:', err);
    }
  });
}