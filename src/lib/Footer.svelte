<footer class="my-10">
  <p class="mb-4 text-center text-sm text-gray-500 md:mb-4">
    © 2025 <a href="https://acolyte.media//" class="hover:underline" target="_blank"> Haven Spec Press, LLC</a>. All rights reserved.
  </p>
  <ul class="flex flex-wrap items-center justify-center gap-6">
    {#each ['Terms', 'Licensing', 'Cookie Policy', 'Contact'] as elem}
      <li>
        <a href="/" class="text-sm font-normal text-gray-500 hover:underline dark:text-gray-300">{elem}</a>
      </li>
    {/each}
  </ul>
</footer>
