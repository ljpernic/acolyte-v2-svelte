<script lang="ts">
  import Navbar from '$lib/Navbar.svelte';
  import Footer from '$lib/Footer.svelte';
  import '/src/app.css';

  // user comes from +layout.server.ts
  export let data;
  const user = data.user;
</script>

{#if user}
  <Navbar user={data.user} />
{/if}

<slot />
<Footer />