<script lang="ts">
  import { Badge } from 'flowbite-svelte';
  import type { BadgeProps } from 'flowbite-svelte';
  import { type StatusBadgeProps, STATES } from './types';

  let { state, dark }: StatusBadgeProps = $props();

  const states = STATES;

  const colors: Record<string, BadgeProps['color']> = {
    completed: 'green',
    cancelled: 'red',
    inreview: 'yellow',
    inprogress: 'purple'
  };
</script>

<Badge color={colors[state] ?? 'gray'} border={dark}>{states[state] ?? 'Unknown'}</Badge>

