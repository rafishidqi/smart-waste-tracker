import { writable } from 'svelte/store';
import mqtt from 'mqtt';

const mqttUrl = import.meta.env.VITE_MQTT_URL;
const mqttUsername = import.meta.env.VITE_MQTT_USERNAME;
const mqttPassword = import.meta.env.VITE_MQTT_PASSWORD;
const mqttTopic = import.meta.env.VITE_MQTT_TOPIC || 'sic/waste/sensors';

/** @type {import('mqtt').MqttClient | undefined} */
let client;

export const mqttStatus = writable('belum terhubung');

// Data contoh tetap ditampilkan sampai pesan pertama diterima.
export const bins = writable([
	{
		id_tongsampah: 'BIN-01',
		volume: 20,
		long: 107.575,
		lat: -6.873,
		suhu: 28,
		tilt: 0,
		alert: 0,
		timestamp: '2026-10-21T10:00:00Z'
	}, // Area Polban (contoh)
	{
		id_tongsampah: 'BIN-02',
		volume: 90,
		long: 107.5765,
		lat: -6.8745,
		suhu: 35,
		tilt: 0,
		alert: 1,
		timestamp: '2026-10-21T10:05:00Z'
	},
	{
		id_tongsampah: 'BIN-03',
		volume: 15,
		long: 107.574,
		lat: -6.875,
		suhu: 45,
		tilt: 45,
		alert: 2,
		timestamp: '2026-10-21T10:10:00Z'
	} // Terguling & Panas
]);

export function connectMQTT() {
	if (client) return client;

	if (!mqttUrl || !mqttUsername || !mqttPassword) {
		const message = 'Konfigurasi MQTT belum lengkap';
		console.warn(
			`${message}. Isi VITE_MQTT_URL, VITE_MQTT_USERNAME, dan VITE_MQTT_PASSWORD di .env.`
		);
		mqttStatus.set(message);
		return null;
	}

	mqttStatus.set('menghubungkan');
	const newClient = mqtt.connect(mqttUrl, {
		username: mqttUsername,
		password: mqttPassword,
		clientId: `waste-dashboard-${crypto.randomUUID()}`,
		clean: true,
		reconnectPeriod: 3000,
		connectTimeout: 10_000
	});
	client = newClient;

	newClient.on('connect', () => {
		newClient.subscribe(mqttTopic, { qos: 1 }, (error) => {
			if (error) {
				console.error('Gagal subscribe MQTT:', error);
				mqttStatus.set('gagal berlangganan topik');
				return;
			}
			console.info(`Terhubung ke HiveMQ dan berlangganan ${mqttTopic}`);
			mqttStatus.set('terhubung');
		});
	});

	newClient.on('reconnect', () => mqttStatus.set('menyambung ulang'));
	newClient.on('offline', () => mqttStatus.set('offline'));
	newClient.on('error', (error) => {
		console.error('Koneksi MQTT bermasalah:', error);
		mqttStatus.set('error koneksi');
	});

	newClient.on('message', (topic, message) => {
		try {
			const newData = JSON.parse(message.toString());
			if (!newData.id_tongsampah) throw new Error('Payload tidak memiliki id_tongsampah');

			// Update data tong sampah yang ada, atau tambah baru jika ID belum ada
			bins.update((currentBins) => {
				const index = currentBins.findIndex((b) => b.id_tongsampah === newData.id_tongsampah);
				if (index !== -1) {
					return currentBins.map((bin, i) => (i === index ? { ...bin, ...newData } : bin));
				} else {
					return [...currentBins, newData];
				}
			});
		} catch (err) {
			console.error('Error parsing MQTT message:', err);
		}
	});

	return newClient;
}

export function disconnectMQTT() {
	if (!client) return;
	client.end(true);
	client = undefined;
	mqttStatus.set('terputus');
}
