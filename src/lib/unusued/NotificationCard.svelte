<script lang="ts">
  import { CardList } from '$lib';
  import type { NotificationCardProps } from './types';

  let { title = 'Email Notifications', subtitle = 'You can set up Themesberg to get email notifications ', items, class: className = 'p-4 sm:p-6' }: NotificationCardProps = $props();
</script>

<CardList {title} {subtitle} {items} class={className} />
