# Smart Waste Tracker

Dashboard SvelteKit menerima pembaruan tong sampah real-time melalui HiveMQ Cloud. Simulator Python menerbitkan payload yang sama ke topik MQTT.

## Konfigurasi lokal

1. Salin `.env.example` menjadi `.env`, lalu isi hostname dan kredensial HiveMQ Cloud. Jangan commit file `.env`.
2. Jalankan dashboard: `npm run dev`.
3. Instal dependensi simulator: `py -m pip install -r src/dummy/requirements.txt`.
4. Jalankan simulator: `py src/dummy/publisher.py`. Simulator otomatis memuat file `.env`.

Publisher memakai MQTT lewat TLS di port `8883`; browser memakai WebSocket aman (WSS) di port `8884` dan path `/mqtt`. Status koneksi terlihat di header dashboard.

## Kontrak pesan

Topik default: `sic/waste/sensors`.

```json
{
	"id_tongsampah": "BIN-01",
	"volume": 20,
	"long": 107.575,
	"lat": -6.873,
	"suhu": 28,
	"tilt": 0,
	"alert": 0,
	"timestamp": "2026-10-22T07:00:00Z"
}
```

Gunakan dua credential berbeda: `sensor-publisher` hanya boleh **publish** ke `sic/waste/sensors`, sedangkan `dashboard-reader` hanya boleh **subscribe** ke topik itu. Karena variabel yang diawali `VITE_` terkirim ke browser, password dashboard harus dibatasi izinnya dan tidak boleh memakai akun admin.
