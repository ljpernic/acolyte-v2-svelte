<script lang="ts">
  import { Card, P, Heading } from 'flowbite-svelte';
  import { Change } from '$lib';
  import type { ProductMetricCardProps } from './types';

  let { chart, title, subTitle, changeProps, cardProps, headingTag = 'h5' }: ProductMetricCardProps = $props();
</script>

<Card horizontal class={cardProps?.class || 'items-center justify-between p-4 sm:p-6'} size={cardProps?.size || 'xl'}>
  <div class="w-full">
    <Heading tag={headingTag}>{title}</Heading>
    <P class="text-2xl leading-none font-bold text-gray-900 sm:text-3xl dark:text-white">{subTitle}</P>
    {#if changeProps}
      <Change {...changeProps} />
    {/if}
  </div>
  {#if chart}
    {@render chart()}
  {/if}
</Card>

