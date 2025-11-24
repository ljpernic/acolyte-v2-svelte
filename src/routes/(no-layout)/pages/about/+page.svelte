<script lang="ts">
  import { Button, DarkMode, NavBrand, NavHamburger, NavLi, NavUl, Navbar, Toggle, P } from 'flowbite-svelte';
  import { ArrowLeftToBracketOutline, CloseOutline } from 'flowbite-svelte-icons';
  import MetaTag from '$lib/utils/MetaTag.svelte';
  import { Faq, Footer } from '$lib';
  import { faqs, menus, rows, prices, brand } from './data';

  let yearly: boolean = $state(false);
  let period = $derived(yearly ? 'year' : 'month');

  const path: string = '/pages/about';
  const description: string = 'About the Acolyte Submission System';
  const title: string = 'About - Acolyte Submission System';
  const subtitle: string = 'About';

</script>

<MetaTag {path} {description} {title} {subtitle} />

<Navbar class="fixed start-0 top-0 z-20 w-full border-b border-gray-200 bg-white px-2 py-1 sm:px-4 dark:border-gray-700 dark:bg-gray-900" color="dark">
  <NavBrand href="/">
    <img src="/images/acolyte-icon-logo.png" class="me-3 h-6 sm:h-9" alt="Acolyte Logo" />
    <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Acolyte</span>
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

<main class="mx-auto bg-gray-50 dark:bg-gray-900">
  <div class="container mx-auto px-4 pt-24 md:pt-32 lg:px-0 dark:bg-gray-900">
    <h1 class="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl sm:leading-none sm:tracking-tight dark:text-white">
      About The Acolyte Submission System
    </h1>
    <p class="mb-6 text-lg font-normal text-gray-700 sm:text-xl dark:text-gray-300">
      Acolyte is a system for managing submissions in a small press. It's goal is to make everyone's life easier. Publications can 
      customize and publish submission forms for their open calls, writers of poetry, fiction, non-fiction, and more can submit to those 
      calls, and editors can process every submission their publication receives in every conceivable case.
    </p>
    <p class="mb-6 text-lg font-normal text-gray-700 sm:text-xl dark:text-gray-300">
      More to come!
    </p>

    <section class="pt-20">
      <Faq {faqs} title="Frequently asked questions" />
    </section>
  </div>
</main>
<Footer />