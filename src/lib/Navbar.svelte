<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { DarkMode } from 'flowbite-svelte';

  // User prop
  export let user: { 
    name: string; 
    email: string; 
    role: string;
    subRole: string;
    formDesignee?: boolean;
    userDesignee?: boolean; 
  } = {
    name: '',
    email: '',
    role: ''
  };

  let showMenu = false;
  let dropdownRef: HTMLElement;

  function handleClickOutside(event: MouseEvent) {
    if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
      showMenu = false;
    }
  }

  onMount(() => {
    if (typeof document !== 'undefined') {
      document.addEventListener('click', handleClickOutside);
    }
  });

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', handleClickOutside);
    }
  });

  async function logout() {
    try {
      const res = await fetch('/logout', { method: 'POST' });
      if (res.ok) {
        window.location.href = '/login';
      } else {
        console.error('Logout failed');
      }
    } catch (err) {
      console.error('Error logging out:', err);
    }
  }
</script>

<nav class="flex items-center justify-between px-8 py-4 bg-gray-100 dark:bg-gray-800 shadow-md">
  <!-- Logo -->
  <div class="font-bold text-xl tracking-tight text-gray-800 dark:text-white">
    Acolyte
  </div>

  <!-- Center buttons -->
  <div class="ms-auto flex items-center space-x-8 pr-8">
    <DarkMode />
    <a href="/dashboard" class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">Dashboard</a>

  <!-- Check userDesignee property to show different link text -->
  {#if user?.userDesignee}
    <a href="/stats" class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">Users</a>
  {:else}
    <a href="/stats" class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">Stats</a>
  {/if}

    <!-- Updated to check formDesignee property -->
    {#if user?.formDesignee}
      <a href="/calls" class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">Calls</a>
    {/if}

    <a href="/how-to" class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">How-To</a>
  </div>

  <!-- User dropdown -->
  <div class="relative" bind:this={dropdownRef}>
    <button
      class="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-4 py-2 rounded transition text-gray-800 dark:text-white"
      on:click={(e) => {
        e.stopPropagation();
        showMenu = !showMenu;
      }}
    >
      <span>{user?.name || 'User'}</span>
      <span class="text-sm">▼</span>
    </button>

    {#if showMenu}
      <div
        class="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-50"
      >
        <a
          href="/change-password"
          class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          Change Password
        </a>
        <button
          class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          on:click={logout}
        >
          Logout
        </button>
      </div>
    {/if}
  </div>
</nav>