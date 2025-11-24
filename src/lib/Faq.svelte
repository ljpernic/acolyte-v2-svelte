<script lang="ts">
  import { Heading, Hr } from 'flowbite-svelte';
  import type { FaqProps } from './types';

  let {
    title = 'Frequently asked questions',
    description = 'Your question might already have been answered, so be sure to read the FAQs before contacting us!',
    faqs
  }: FaqProps = $props();
</script>

<Heading tag="h1" class="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl sm:leading-none sm:tracking-tight dark:text-white">
  {title}
</Heading>
<p class="mb-6 text-lg font-normal text-gray-500 sm:text-xl dark:text-gray-300">
  {description}
</p>
<Hr />
<div class="gap-8 space-y-10 lg:columns-1">
  {#each faqs as { title, answer }}
    <div class="space-y-4">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
      {@html answer}
    </div>
  {/each}
</div>
