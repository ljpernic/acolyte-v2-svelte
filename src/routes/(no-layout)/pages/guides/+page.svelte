<script lang="ts">
  import { Button, DarkMode, NavBrand, NavHamburger, NavLi, NavUl, Navbar, Toggle, P } from 'flowbite-svelte';
  import { ArrowLeftToBracketOutline, CloseOutline } from 'flowbite-svelte-icons';
  import MetaTag from '../../../utils/MetaTag.svelte';
  import { PriceCard, PriceCardListItem, ComparisonTable, Faq, Footer } from '$lib';
  import { faqs, menus, rows, prices, brand } from './data';

  let yearly: boolean = $state(false);
  let period = $derived(yearly ? 'year' : 'month');

  const path: string = '/pages/guides';
  const description: string = 'Guides for using the Acolyte Submission System';
  const title: string = 'Guides - Acolyte Submission System';
  const subtitle: string = 'Guides';

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
        <a href="/pages/about" sveltekit:prefetch>About</a>
      </NavLi>
      <NavLi>
        <a href="/pages/presses" sveltekit:prefetch>Presses</a>
      </NavLi>
      <NavLi>
        <a href="/pages/features" sveltekit:prefetch>Features</a>
      </NavLi>
      <NavLi>
        <a href="/pages/guides" sveltekit:prefetch>Guides</a>
      </NavLi>
      <NavLi>
        <a href="/pages/contact" sveltekit:prefetch>Contact</a>
      </NavLi>
    </NavUl>
    <div class="py-4">
      <DarkMode />
    </div>
</Navbar>
<main class="mx-auto bg-gray-50 dark:bg-gray-900">
  <div class="container mx-auto px-4 pt-24 md:pt-32 lg:px-0 dark:bg-gray-900">
    <h1 class="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl sm:leading-none sm:tracking-tight dark:text-white">Guides for Using the Acolyte Submission System</h1>
    <p class="mb-6 text-lg font-normal text-gray-700 sm:text-xl dark:text-gray-300">
      Other text. Other text. Other text. Other text. Other text. Other text. Other text. Other text. Other text. Other text. Other text. 
    </p>
  </div>
</main>
<Footer />
