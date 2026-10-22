import json
import os
import random
import time
from datetime import datetime, timezone
import paho.mqtt.client as mqtt
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

HOST = os.getenv("MQTT_HOST")
PORT = int(os.getenv("MQTT_PORT", "8883"))
TOPIC = os.getenv("MQTT_TOPIC", "sic/waste/sensors")
USERNAME = os.getenv("MQTT_USERNAME")
PASSWORD = os.getenv("MQTT_PASSWORD")

if not all([HOST, USERNAME, PASSWORD]):
    raise SystemExit(
        "MQTT_HOST, MQTT_USERNAME, dan MQTT_PASSWORD wajib diisi. "
        "Salin .env.example menjadi .env lalu isi kredensial HiveMQ Cloud."
    )

client = mqtt.Client(
    mqtt.CallbackAPIVersion.VERSION2,
    client_id=f"py_sim_{random.randint(1000, 9999)}",
)
client.username_pw_set(USERNAME, PASSWORD)
client.tls_set()  # HiveMQ Cloud hanya menerima koneksi TLS.
client.connect(HOST, PORT, keepalive=60)
client.loop_start()

# Kondisi awal sesuai dummy di store
bins = [
    {"id_tongsampah": "BIN-01", "volume": 20, "long": 107.5750, "lat": -6.8730, "suhu": 28, "tilt": 0},
    {"id_tongsampah": "BIN-02", "volume": 90, "long": 107.5765, "lat": -6.8745, "suhu": 35, "tilt": 0},
    {"id_tongsampah": "BIN-03", "volume": 15, "long": 107.5740, "lat": -6.8750, "suhu": 45, "tilt": 45},
]

def calc_alert(b):
    if b["tilt"] >= 30 or b["suhu"] >= 40:
        return 2  # terguling / terlalu panas
    if b["volume"] >= 80:
        return 1  # hampir penuh
    return 0

try:
    while True:
        for b in bins:
            b["volume"] = min(100, b["volume"] + random.randint(0, 3))
            if b["volume"] >= 100 and random.random() < 0.3:
                b["volume"] = random.randint(5, 15)  # simulasi dikosongkan
            b["suhu"] = round(max(25, min(50, b["suhu"] + random.uniform(-1, 1))), 1)
            b["tilt"] = random.choice([0, 0, 0, 0, 0, 45]) if random.random() < 0.1 else b["tilt"]

            payload = {
                **b,
                "alert": calc_alert(b),
                "timestamp": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
            }
            client.publish(TOPIC, json.dumps(payload), qos=0)
            print("sent:", payload)
        time.sleep(3)
except KeyboardInterrupt:
    client.loop_stop()
    client.disconnect()
