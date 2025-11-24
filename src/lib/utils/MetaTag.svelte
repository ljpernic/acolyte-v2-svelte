<script lang="ts">
  import { RunesMetaTags } from 'runes-meta-tags';

  interface Props {
    path: string;
    description: string;
    title: string;
    subtitle: string;
  }
  let { path, description, title, subtitle }: Props = $props();

  let imgsrc = `/images/acolyte-icon-logo.png`;

  let og_url: string = `https://acolyte.media`;
</script>

<RunesMetaTags
  {title}
  {description}
  og={{
    type: 'website',
    url: `${og_url}`,
    title: `${title}`,
    description: `${description}`,
    image: imgsrc,
    imageWidth: 1200,
    imageHeight: 630,
    imageAlt: `Acolyte Submission System - ${title}`,
    siteName: 'Acolyte Submission System'
  }}
  twitter={{
    card: 'summary_large_image',
    title: `${title}`,
    description: `${description}`,
    image: imgsrc,
    imageAlt: `Acolyte Submission System - ${title}`
  }}
/>