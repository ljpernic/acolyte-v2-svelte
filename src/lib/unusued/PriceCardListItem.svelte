<script lang="ts">
  import { Li } from 'flowbite-svelte';
  import { CheckOutline } from 'flowbite-svelte-icons';
  import type { PriceCardListItemProps } from './types';

  let { icon, children }: PriceCardListItemProps = $props();
</script>

<Li {icon} class="flex items-center space-x-3">
  {#if !icon}
    <CheckOutline size="md" class="text-green-500 dark:text-green-400" />
  {/if}
  <span class="dark:text-white">
    {@render children()}
  </span>
</Li>
