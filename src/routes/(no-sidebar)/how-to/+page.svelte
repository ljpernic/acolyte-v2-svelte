<script lang="ts">
  import type { PageData } from './$types';
  
  export let data: PageData;
  const { user } = data;
</script>

<div class="max-w-4xl mx-auto p-6 space-y-8">
  <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Reader Guidelines</h1>
  
  <section class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
    <h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Getting Started</h2>
    <div class="prose text-gray-900 dark:text-white dark:prose-invert max-w-none">
      <p>Welcome to the Acolyte Submission System...</p>
    </div>
  </section>

  <section class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
    <h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Submission Process</h2>
    <div class="prose text-gray-900 dark:text-white dark:prose-invert max-w-none">
      <ol>
        <li>Review the submission thoroughly</li>
        <li>Add your notes in the Reader Notes field</li>
        <li>Choose appropriate recommendation or rejection level</li>
      </ol>
    </div>
  </section>
</div>