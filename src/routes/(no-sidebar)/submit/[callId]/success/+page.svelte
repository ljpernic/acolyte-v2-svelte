<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  export let data: PageData;
  $: call = data.call;
  
  let currentUrl = '';
  
  onMount(() => {
    currentUrl = window.location.origin;
  });
  
  function handleClose() {
    if (window.opener) {
      window.close();
    } else {
      goto('/');
    }
  }
</script>

<svelte:head>
  <title>Submission Successful - {call.title}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full">
    <div class="bg-white shadow rounded-lg p-8 text-center" role="main" aria-live="polite">
      <!-- Success Icon -->
      <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-6" aria-label="Success">
        <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>

      <!-- Success Message -->
      <h1 class="text-2xl font-bold text-gray-900 mb-4">
        Submission Successful!
      </h1>
      
      <p class="text-gray-600 mb-6">
        Thank you for your submission to <strong>{call.title}</strong>. 
        We've received your work and will review it according to our process.
      </p>

      <!-- Additional Info -->
      <div class="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3 text-left">
            <h3 class="text-sm font-medium text-blue-800">What happens next?</h3>
            <div class="mt-2 text-sm text-blue-700">
              <ul class="list-disc list-inside space-y-1">
                <li>Your submission has been logged in our system</li>
                <li>Our review team will evaluate all submissions</li>
                <li>You'll be contacted if your work is selected</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-3">
        <a 
          href="/submit/{call.id}"
          class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Submit Another Piece
        </a>
        
        <button
          on:click={handleClose}
          class="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Close
        </button>
      </div>
      
      <!-- Small Print -->
      {#if currentUrl}
        <p class="mt-6 text-xs text-gray-500">
          Please save this URL for your records: 
          <span class="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-700">
            {currentUrl}/submit/{call.id}
          </span>
        </p>
      {/if}
    </div>
  </div>
</div>