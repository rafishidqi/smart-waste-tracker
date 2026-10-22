<script>
  import { bins } from '#lib/store.js';
</script>

<div class="h-full overflow-y-auto p-6">
  <div class="mb-6 flex items-center justify-between">
    <h2 class="text-2xl font-bold text-gray-800">Data Pemantauan Keseluruhan</h2>
  </div>

  <div class="overflow-x-auto rounded-lg bg-white shadow-lg border border-gray-200">
    <table class="w-full text-left text-sm text-gray-600">
      <thead class="bg-gray-50 text-gray-800 border-b border-gray-200">
        <tr>
          <th class="px-6 py-4 font-semibold">ID Tong</th>
          <th class="px-6 py-4 font-semibold">Volume (%)</th>
          <th class="px-6 py-4 font-semibold">Suhu (°C)</th>
          <th class="px-6 py-4 font-semibold">Tilt (Kemiringan)</th>
          <th class="px-6 py-4 font-semibold">Status Alert</th>
          <th class="px-6 py-4 font-semibold">Update Terakhir</th>
        </tr>
      </thead>
      <tbody>
        {#each $bins as bin}
          <tr class="border-b border-gray-100 hover:bg-gray-50">
            <td class="px-6 py-4 font-medium">{bin.id_tongsampah}</td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <div class="w-full bg-gray-200 rounded-full h-2.5 max-w-25">
                  <div class="h-2.5 rounded-full {bin.volume > 80 ? 'bg-red-500' : 'bg-emerald-500'}" style="width: {bin.volume}%"></div>
                </div>
                <span>{bin.volume}%</span>
              </div>
            </td>
            <td class="px-6 py-4 {bin.suhu > 40 ? 'text-red-600 font-bold' : ''}">{bin.suhu}°C</td>
            <td class="px-6 py-4 {bin.tilt > 20 ? 'text-orange-600 font-bold' : ''}">{bin.tilt}°</td>
            <td class="px-6 py-4">
              {#if bin.alert === 0}
                <span class="rounded-full bg-green-100 px-3 py-1 text-green-700">Aman</span>
              {:else if bin.alert === 1}
                <span class="rounded-full bg-orange-100 px-3 py-1 text-orange-700">Warning</span>
              {:else}
                <span class="rounded-full bg-red-100 px-3 py-1 font-bold text-red-700 animate-pulse">Kritis</span>
              {/if}
            </td>
            <td class="px-6 py-4 text-xs text-gray-500">{new Date(bin.timestamp).toLocaleTimeString()}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>