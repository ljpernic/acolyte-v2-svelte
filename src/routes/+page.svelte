<script lang="ts">
  import { Button, DarkMode, NavBrand, NavHamburger, NavLi, NavUl, Navbar, Toggle, P } from 'flowbite-svelte';
  import { ArrowLeftToBracketOutline, CloseOutline } from 'flowbite-svelte-icons';

</script>

<Navbar class="fixed start-0 top-0 z-20 w-full border-b border-gray-200 bg-white px-2 py-1 sm:px-4 dark:border-gray-700 dark:bg-gray-900" color="dark">
  <NavBrand href="/">
    <img src="/images/acolyte-icon-logo.png" class="me-3 h-6 sm:h-9" alt="Flowbite Logo" />
    <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Flowbite</span>
  </NavBrand>
  <NavHamburger />
  <NavUl class="ms-8 me-auto">
    <NavLi>
      <a href="/pages/about" data-sveltekit-preload-data="hover">About</a>
    </NavLi>
    <NavLi>
      <a href="/pages/presses" data-sveltekit-preload-data="hover">Presses</a>
    </NavLi>
    <NavLi>
      <a href="/pages/features" data-sveltekit-preload-data="hover">Features</a>
    </NavLi>
    <NavLi>
      <a href="/pages/guides" data-sveltekit-preload-data="hover">Guides</a>
    </NavLi>
        <NavLi>
      <a href="/pages/contact" data-sveltekit-preload-data="hover">Contact</a>
    </NavLi>
  </NavUl>
  <div class="py-4">
    <DarkMode />
  </div>
</Navbar>

<main class="flex flex-col items-center justify-center min-h-screen p-4 bg-white dark:bg-gray-900">
  <h1 class="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Welcome to Acolyte Submissions</h1>
  <p class="mb-6 text-center text-gray-700 dark:text-gray-300">
    Access your dashboard by logging in.
  </p>
  <a href="/login" class="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
    Go to Login
  </a>
</main>