<script>
  import './layout.css';
  import { onMount } from 'svelte';
  import { connectMQTT } from '#lib/store.js';

  let { children } = $props();

  onMount(() => {
    // Mulai koneksi ke HiveMQ begitu web dibuka
    connectMQTT();
  });
</script>

<div class="flex h-screen flex-col bg-gray-100">
  <!-- Navbar -->
  <header class="flex items-center justify-between bg-emerald-700 px-6 py-4 text-white shadow-md">
    <h1 class="text-2xl font-bold tracking-tight">Smart Waste Tracker</h1>
    <nav class="flex gap-4">
      <a href="/" class="rounded-md bg-emerald-800 px-4 py-2 hover:bg-emerald-600 transition">Map View</a>
      <a href="/monitoring" class="rounded-md bg-emerald-800 px-4 py-2 hover:bg-emerald-600 transition">Monitoring</a>
    </nav>
  </header>

  <!-- Konten Tab -->
  <main class="flex-1 overflow-hidden">
    {@render children()}
  </main>
</div>