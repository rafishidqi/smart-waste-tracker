<script>
  import { onMount } from 'svelte';
  import { bins } from '\#lib/store.js';

  let mapElement;
  let map;
  let markers = {}; 

  onMount(async () => {
    // Import leaflet di client-side saja (SSR safe)
    const L = await import('leaflet');
    import('leaflet/dist/leaflet.css');

    // Inisialisasi peta (Fokus ke koordinat contoh, misal area Bandung/Polban)
    map = L.map(mapElement).setView([-6.8730, 107.5750], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // Subscribe ke perubahan store 'bins' untuk update marker real-time
    bins.subscribe((data) => {
      data.forEach(bin => {
        // Tentukan warna marker berdasarkan alert
        let color = bin.alert === 2 ? 'red' : (bin.alert === 1 || bin.volume > 80) ? 'orange' : 'green';
        
        const popupContent = `
          <b>${bin.id_tongsampah}</b><br>
          Volume: ${bin.volume}%<br>
          Suhu: ${bin.suhu}°C<br>
          Status: ${bin.alert === 0 ? 'Aman' : bin.alert === 1 ? 'Penuh/Warning' : 'Kritis (Miring/Api)'}
        `;

        if (markers[bin.id_tongsampah]) {
          markers[bin.id_tongsampah].setLatLng([bin.lat, bin.long]);
          markers[bin.id_tongsampah].getPopup().setContent(popupContent);
        } else {
          markers[bin.id_tongsampah] = L.circleMarker([bin.lat, bin.long], {
            color: color,
            fillOpacity: 0.8,
            radius: 12
          }).bindPopup(popupContent).addTo(map);
        }
      });
    });
  });
</script>

<!-- Container Peta Full Screen (dikurangi tinggi navbar) -->
<div bind:this={mapElement} class="h-full w-full z-0"></div>